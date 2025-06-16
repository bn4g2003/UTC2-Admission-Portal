import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/use-auth';
import VideoCall from '@/components/VideoCall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Phone } from 'lucide-react';

export default function JoinVideoCall() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();
  
  const [videoCallData, setVideoCallData] = useState<{
    roomId: string;
    authToken: string;
    userName: string;
  } | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinVideoCall = async () => {
    if (!roomId || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get auth token from API
      const response = await fetch('/api/video/auth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          roomId: roomId as string, 
          role: 'guest' 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVideoCallData({
          roomId: data.roomId,
          authToken: data.authToken,
          userName: data.userName
        });
        setShowVideoCall(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể tham gia cuộc gọi');
      }
    } catch (error) {
      console.error('Error joining video call:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Yêu cầu đăng nhập</CardTitle>
            <CardDescription>
              Bạn cần đăng nhập để tham gia cuộc gọi video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="h-3 w-3 text-white" />
            </div>
          </div>
          <CardTitle>Tham gia cuộc gọi video</CardTitle>
          <CardDescription>
            Room ID: {roomId}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={joinVideoCall}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tham gia...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Tham gia cuộc gọi
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Quay lại
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Đảm bảo microphone và camera đã được cấp quyền truy cập
          </div>
        </CardContent>
      </Card>

      {/* Video Call Component */}
      {showVideoCall && videoCallData && (
        <VideoCall
          isOpen={showVideoCall}
          roomId={videoCallData.roomId}
          authToken={videoCallData.authToken}
          userName={videoCallData.userName}
          onClose={() => {
            setShowVideoCall(false);
            setVideoCallData(null);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
}
