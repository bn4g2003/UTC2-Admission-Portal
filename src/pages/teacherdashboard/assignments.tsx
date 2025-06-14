import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../../hooks/use-auth';

type Assignment = {
  id: string;
  assignment_details: string;
  status: string;
  assigned_at: string;
  completed_at: string | null;
  stage_id: string;
  stage_name: string;
  stage_description: string;
  start_time: string;
  end_time: string;
  plan_id: string;
  plan_name: string;
};

export default function TeacherAssignments() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'GIAOVIEN') {
      fetchAssignments();
    }
  }, [user, statusFilter]);
  const fetchAssignments = async () => {
    try {
      setIsLoadingAssignments(true);
      const url = '/api/teacher/assignments';
      const params: Record<string, string> = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      console.log('Fetching assignments with params:', params);
      const response = await axios.get(url, { params });
      console.log('Assignments response:', response.data);
      setAssignments(response.data as Assignment[]);
      setIsLoadingAssignments(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setIsLoadingAssignments(false);
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      await axios.put('/api/teacher/assignments', {
        assignmentId,
        newStatus
      });
      
      // Refetch the assignments to update the list
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'in_progress': return 'bg-blue-200 text-blue-800';
      case 'completed': return 'bg-green-200 text-green-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
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
        <h1 className="text-2xl font-bold">Nhiệm vụ của tôi</h1>
        <Button onClick={() => router.push('/teacherdashboard')}>
          Quay lại
        </Button>
      </div>

      <div className="mb-6 flex items-center">
        <label className="mr-2 font-medium">Lọc theo trạng thái:</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoadingAssignments ? (
        <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>
      ) : assignments.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Không tìm thấy nhiệm vụ nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {assignment.plan_name} - {assignment.stage_name}
                    </CardTitle>
                    <CardDescription>
                      Thời gian: {formatDate(assignment.start_time)} - {formatDate(assignment.end_time)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status === 'pending' ? 'Chờ xử lý' :
                     assignment.status === 'in_progress' ? 'Đang thực hiện' :
                     assignment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium mb-1">Chi tiết nhiệm vụ:</h3>
                  <p className="text-gray-700">{assignment.assignment_details}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Được giao ngày: {formatDate(assignment.assigned_at)}
                    </p>
                    {assignment.completed_at && (
                      <p className="text-sm text-gray-500">
                        Hoàn thành ngày: {formatDate(assignment.completed_at)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {assignment.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStatusChange(assignment.id, 'in_progress')}
                      >
                        Bắt đầu thực hiện
                      </Button>
                    )}
                    
                    {assignment.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStatusChange(assignment.id, 'completed')}
                      >
                        Đánh dấu hoàn thành
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      onClick={() => router.push(`/teacherdashboard/assignments/${assignment.id}`)}
                    >
                      Chi tiết
                    </Button>
                    
                    {(assignment.status === 'in_progress' || assignment.status === 'completed') && (
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
                      >
                        Gửi báo cáo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
