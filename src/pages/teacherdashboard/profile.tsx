import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/use-auth';
import { CalendarIcon, Mail, Phone, User } from 'lucide-react';
import { Separator } from '../../components/ui/separator';

type UserProfile = {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone_number: string;
  address: string;
  date_of_birth?: string;
};

export default function TeacherProfile() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'GIAOVIEN') {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await axios.get('/api/teacher/profile');
      setProfile(response.data as UserProfile);
      setEditedProfile(response.data as UserProfile);
      setLoadingProfile(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin cá nhân',
        variant: 'destructive',
      });
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Only send the fields that have been edited
      const changedFields: Partial<UserProfile> = {};
      for (const key in editedProfile) {
        if (profile && profile[key as keyof UserProfile] !== editedProfile[key as keyof UserProfile]) {
          changedFields[key as keyof UserProfile] = editedProfile[key as keyof UserProfile];
        }
      }
      
      await axios.put('/api/teacher/profile', changedFields);
      
      toast({
        title: 'Thành công',
        description: 'Thông tin cá nhân đã được cập nhật',
      });
      
      // Refresh the profile
      fetchUserProfile();
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin cá nhân',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <Button onClick={() => router.push('/teacherdashboard')}>
          Quay lại Dashboard
        </Button>
      </div>
      
      {loadingProfile ? (
        <div className="flex items-center justify-center h-64">Đang tải thông tin...</div>
      ) : (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Hồ sơ cá nhân</CardTitle>
            <CardDescription>Xem và chỉnh sửa thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{profile?.full_name || 'N/A'}</h3>
                    <p className="text-muted-foreground">{profile?.role === 'GIAOVIEN' ? 'Giáo viên' : profile?.role}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p>{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Số điện thoại</span>
                      <p>{profile?.phone_number || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm text-muted-foreground">Địa chỉ</span>
                      <p>{profile?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  {profile?.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Ngày sinh</span>
                        <p>{new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Họ và tên</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    value={editedProfile.full_name || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={editedProfile.email || ''} 
                    onChange={handleInputChange} 
                    required 
                    readOnly 
                  />
                  <p className="text-sm text-muted-foreground">Email không thể thay đổi</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">Số điện thoại</Label>
                  <Input 
                    id="phone_number" 
                    name="phone_number" 
                    value={editedProfile.phone_number || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={editedProfile.address || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date_of_birth">Ngày sinh</Label>
                  <Input 
                    id="date_of_birth" 
                    name="date_of_birth" 
                    type="date"
                    value={editedProfile.date_of_birth ? 
                      new Date(editedProfile.date_of_birth).toISOString().split('T')[0] : ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Chỉnh sửa thông tin
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
