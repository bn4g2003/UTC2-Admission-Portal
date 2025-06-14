import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../../../hooks/use-auth';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Calendar, User, Paperclip } from 'lucide-react';

type Assignment = {
  id: string;
  assignment_details: string;
  status: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  stage_id: string;
  stage_name: string;
  stage_description: string;
  start_time: string;
  end_time: string;
  stage_order: number;
  plan_id: string;
  plan_name: string;
  year_start: string;
  plan_description: string;
  plan_start_date: string;
  plan_end_date: string;
  plan_status: string;
  stage_status: string;
  assigned_to: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    department: string;
  };
  reports: {
    id: string;
    report_content: string;
    has_documents: boolean;
    submitted_at: string;
    report_status: string;
    reviewed_at: string | null;
    review_comments: string | null;      documents?: {
      downloadUrl: any;
      error?: string;
      id: string;
      document_name: string;
      file_path: string;
      file_type: string;
      file_size_kb: number;
      uploaded_at: string;
    }[];
  }[];
};

export default function AssignmentDetails() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'GIAOVIEN' && id) {
      fetchAssignmentDetails();
    }
  }, [user, id]);
  const fetchAssignmentDetails = async () => {
    try {
      setLoadingAssignment(true);
      setError(null);
      
      console.log('Fetching assignment details for ID:', id);
      const response = await axios.get('/api/teacher/assignment-details', {
        params: { assignmentId: id }
      });
      
      console.log('Assignment details response:', response.status);
      setAssignment(response.data as Assignment);
      setLoadingAssignment(false);
    } catch (error: any) {
      console.error('Error fetching assignment details:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải thông tin nhiệm vụ.';
      const errorDetails = error.response?.data?.error || '';
      
      setError(`${errorMessage}${errorDetails ? ` - Chi tiết: ${errorDetails}` : ''}`);
      setLoadingAssignment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put('/api/teacher/assignments', {
        assignmentId: id,
        newStatus
      });
      
      // Refetch the assignment to update the displayed data
      fetchAssignmentDetails();
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

  const getStageStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sắp_diễn_ra': return 'bg-purple-200 text-purple-800';
      case 'đang_diễn_ra': return 'bg-blue-200 text-blue-800';
      case 'hoàn_thành': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã_gửi':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Chờ duyệt
        </Badge>;
      case 'đã_duyệt':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Đã duyệt
        </Badge>;
      case 'từ_chối':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Từ chối
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">
          {status}
        </Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
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

  if (loadingAssignment) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      Đang tải thông tin nhiệm vụ...
    </div>;
  }

  if (error) {
    return <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/teacherdashboard/assignments')}>
            Quay lại danh sách nhiệm vụ
          </Button>
        </CardContent>
      </Card>
    </div>;
  }

  if (!assignment) {
    return <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Không tìm thấy</CardTitle>
          <CardDescription>Không tìm thấy thông tin nhiệm vụ được yêu cầu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/teacherdashboard/assignments')}>
            Quay lại danh sách nhiệm vụ
          </Button>
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chi tiết Nhiệm vụ</h1>
        <Button onClick={() => router.push('/teacherdashboard/assignments')}>
          Quay lại danh sách
        </Button>
      </div>

      {/* Thông tin nhiệm vụ */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.plan_name}</CardTitle>
              <CardDescription>Giai đoạn: {assignment.stage_name}</CardDescription>
            </div>
            <div className="flex gap-2">              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status === 'pending' ? 'Chờ xử lý' :
                 assignment.status === 'in_progress' ? 'Đang thực hiện' :
                 assignment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
              </Badge>
              <Badge className={getStageStatusColor(assignment.stage_status)}>
                Giai đoạn: {assignment.stage_status === 'sắp_diễn_ra' ? 'Sắp diễn ra' :
                 assignment.stage_status === 'đang_diễn_ra' ? 'Đang diễn ra' : 'Đã kết thúc'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Chi tiết nhiệm vụ</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.assignment_details}</p>
            {assignment.notes && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Ghi chú:</h4>
                <p className="text-gray-600">{assignment.notes}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Kế hoạch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-500 w-32">Kế hoạch:</span>
                  <span>{assignment.plan_name} ({assignment.year_start})</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-32">Mô tả:</span>
                  <span className="flex-1">{assignment.plan_description}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Thời gian:</span>
                  <span>{formatDate(assignment.plan_start_date)} - {formatDate(assignment.plan_end_date)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Giai đoạn</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-500 w-32">Giai đoạn:</span>
                  <span>{assignment.stage_name} (Thứ tự: {assignment.stage_order})</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-32">Mô tả:</span>
                  <span className="flex-1">{assignment.stage_description}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Thời gian:</span>
                  <span>{formatDate(assignment.start_time)} - {formatDate(assignment.end_time)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Thông tin phân công</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-500 w-32">Được phân công cho:</span>
                  <span>{assignment.assigned_to.full_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-500 w-32">Ngày phân công:</span>
                  <span>{formatDateTime(assignment.assigned_at)}</span>
                </div>
                {assignment.completed_at && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-500 w-32">Ngày hoàn thành:</span>
                    <span>{formatDateTime(assignment.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          {assignment.status === 'pending' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('in_progress')}
            >
              Bắt đầu thực hiện
            </Button>
          )}
          
          {assignment.status === 'in_progress' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('completed')}
            >
              Đánh dấu hoàn thành
            </Button>
          )}
          
          {(assignment.status === 'in_progress' || assignment.status === 'completed') && (
            <Button 
              onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" /> Gửi báo cáo
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Danh sách báo cáo liên quan */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Báo cáo đã gửi</h2>
        
        {assignment.reports && assignment.reports.length > 0 ? (
          <div className="space-y-4">
            {assignment.reports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-md">Báo cáo ngày {formatDate(report.submitted_at)}</CardTitle>
                    {getReportStatusBadge(report.report_status)}
                  </div>
                  <CardDescription>Gửi lúc: {formatDateTime(report.submitted_at)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Nội dung báo cáo:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.report_content}</p>
                    </div>
                    
                    {report.has_documents && report.documents && report.documents.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1 flex items-center">
                          <Paperclip className="w-4 h-4 mr-1" /> Tài liệu đính kèm:
                        </h4>
                        <div className="space-y-2">
                          {report.documents.map(doc => (                                <div key={doc.id} className="bg-gray-50 p-2 rounded-md flex justify-between items-center">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{doc.document_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.file_type} • {formatFileSize(doc.file_size_kb)} • 
                                      Tải lên ngày {formatDate(doc.uploaded_at)}
                                    </p>
                                  </div>                                {doc.downloadUrl ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => window.open(doc.downloadUrl, '_blank')}
                                    >
                                      Tải xuống
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                                      title={doc.error ? `Không thể tạo URL: ${doc.error}` : 'Xem chi tiết báo cáo'}
                                    >
                                      {doc.error ? 'Lỗi tải xuống' : 'Xem chi tiết'}
                                    </Button>
                                  )}
                                </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {report.review_comments && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium text-sm mb-1">Phản hồi của Trưởng ban:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{report.review_comments}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {report.reviewed_at && `Duyệt ngày ${formatDateTime(report.reviewed_at)}`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                  >
                    Xem chi tiết báo cáo
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chưa có báo cáo nào cho nhiệm vụ này.</p>
              {(assignment.status === 'in_progress' || assignment.status === 'completed') && (
                <Button 
                  className="mt-4"
                  onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
                >
                  Gửi báo cáo mới
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
