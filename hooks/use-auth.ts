import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseAuthOptions {
  redirectTo?: string;
  requireRole?: 'TRUONGBAN' | 'GIAOVIEN';
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    name: string;id: string; role: string; email: string
} | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          const data = await response.json();
          
          if (response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            if (options.redirectTo) {
              router.push(`/auth/login?redirect=${encodeURIComponent(options.redirectTo)}`);
            } else {
              router.push('/auth/login');
            }
            return;
          }
          
          throw new Error(data.message || 'Authentication failed');
        }

        const data = await response.json();

        // Kiểm tra role nếu được yêu cầu
        if (options.requireRole && data.role !== options.requireRole) {
          router.push('/auth/login');
          return;
        }

        setUser(data);
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        if (options.redirectTo) {
          router.push(`/auth/login?redirect=${encodeURIComponent(options.redirectTo)}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, options.redirectTo, options.requireRole]);
  // Hàm đăng xuất
  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Đăng xuất thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { 
    isLoading, 
    error, 
    user, 
    logout,
    isLoggingOut
  };
}
