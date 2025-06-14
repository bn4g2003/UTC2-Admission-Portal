import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../../hooks/use-auth';

type EnrollmentPlan = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  stages_count: number;
  status: 'upcoming' | 'ongoing' | 'completed';
};

export default function TeacherEnrollmentPlans() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<EnrollmentPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'GIAOVIEN') {
      fetchEnrollmentPlans();
    }
  }, [user]);

  const fetchEnrollmentPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const response = await axios.get('/api/teacher/enrollment-plans');
      setPlans(response.data as EnrollmentPlan[]);
      setIsLoadingPlans(false);
    } catch (error) {
      console.error('Error fetching enrollment plans:', error);
      setIsLoadingPlans(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-200 text-blue-800';
      case 'ongoing': return 'bg-green-200 text-green-800';
      case 'completed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
        <h1 className="text-2xl font-bold">Kế hoạch Tuyển sinh</h1>
        <Button onClick={() => router.push('/teacherdashboard')}>
          Quay lại
        </Button>
      </div>
      
      {isLoadingPlans ? (
        <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>
      ) : plans.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Không có kế hoạch tuyển sinh nào được phân công</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status === 'upcoming' ? 'Sắp diễn ra' : 
                     plan.status === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                  </Badge>
                </div>
                <CardDescription>
                  {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {plan.description}
                  </p>
                  <p className="text-sm mt-2">
                    Số giai đoạn: <span className="font-semibold">{plan.stages_count}</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/teacherdashboard/enrollment-plans/${plan.id}`)}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
