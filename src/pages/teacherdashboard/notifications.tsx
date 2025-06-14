import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../../hooks/use-auth';

type Notification = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by_name: string;
  is_read: boolean;
  read_at: string | null;
};

export default function TeacherNotifications() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'GIAOVIEN') {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await axios.get('/api/teacher/notifications');
      setNotifications(response.data as Notification[]);
      setIsLoadingNotifications(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put('/api/teacher/notifications', {
        notificationId: id,
      });
      
      // Update the local state to mark this notification as read
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(notification => !notification.is_read)
    : notifications;

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (user?.role !== 'GIAOVIEN') {
    return <div className="flex items-center justify-center min-h-screen">
      Bạn không có quyền truy cập trang này. Trang này chỉ dành cho Giáo viên.
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông báo của tôi</h1>
        <Button onClick={() => router.push('/teacherdashboard')}>
          Quay lại
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoadingNotifications ? (
        <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">
            {activeTab === 'all' ? 'Không có thông báo' : 'Không có thông báo chưa đọc'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {notification.title}
                      {!notification.is_read && (
                        <Badge className="ml-2 bg-blue-200 text-blue-800">
                          Mới
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Từ: {notification.created_by_name} - {formatDate(notification.created_at)}
                    </CardDescription>
                  </div>
                  
                  {notification.is_read ? (
                    <Badge variant="outline" className="bg-gray-100">
                      Đã đọc
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">
                  {notification.content}
                </div>
                
                {notification.read_at && (
                  <div className="mt-4 text-xs text-gray-500">
                    Đã đọc lúc: {formatDate(notification.read_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
