import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface UseAuthOptions {
  redirectTo?: string;
  requireRole?: 'TRUONGBAN' | 'GIAOVIEN';
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{id: string; role: string; email: string} | null>(null);

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

  return { isLoading, error, user };
}
