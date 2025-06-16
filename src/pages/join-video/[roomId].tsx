import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VideoCall from '@/components/VideoCall';
import { useAuth } from '../../../hooks/use-auth';

export default function JoinVideoPage() {
  const router = useRouter();
  const { roomId } = router.query; // Room ID thật từ URL
  const { user } = useAuth();
  const [authToken, setAuthToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!roomId || !user) return;

    const getAuthToken = async () => {
      try {
        console.log('Getting auth token for room ID:', roomId);
          const response = await fetch('/api/video/auth-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: roomId, // Dùng room ID thật
            role: 'viewer', // Use viewer role for joining
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get auth token');
        }

        const data = await response.json();
        setAuthToken(data.authToken);
      } catch (error) {
        console.error('Error getting auth token:', error);
        setError('Không thể tham gia cuộc gọi video');
      } finally {
        setLoading(false);
      }
    };

    getAuthToken();
  }, [roomId, user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (!authToken || !roomId) {
    return <div className="flex items-center justify-center min-h-screen">Không thể tải cuộc gọi video</div>;
  }
  return (
    <VideoCall
      isOpen={true}
      authToken={authToken}
      userName={user?.name || 'Guest'}
      onClose={() => router.push('/chat')}
    />
  );
}