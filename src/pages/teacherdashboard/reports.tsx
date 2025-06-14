import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../../hooks/use-auth';

type Report = {
  id: string;
  report_content: string;
  has_documents: boolean;
  submitted_at: string;
  report_status: string;
  reviewed_at: string | null;
  review_comments: string | null;
  assignment_id: string;
  assignment_details: string;
  assignment_status: string;
  stage_name: string;
  plan_name: string;
  documents?: Array<{
    id: string;
    document_name: string;
    file_path: string;
    file_type: string;
    file_size_kb: number;
    uploaded_at: string;
  }>;
};

export default function TeacherReports() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'GIAOVIEN') {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await axios.get('/api/teacher/reports');
      setReports(response.data as Report[]);
      setIsLoadingReports(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setIsLoadingReports(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-200 text-blue-800';
      case 'reviewed': return 'bg-green-200 text-green-800';
      case 'rejected': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.report_status === statusFilter);

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
        <h1 className="text-2xl font-bold">Báo cáo của tôi</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/teacherdashboard/assignments')}>
            Nhiệm vụ
          </Button>
          <Button onClick={() => router.push('/teacherdashboard')}>
            Quay lại
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <label className="mr-2 font-medium">Lọc theo trạng thái:</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="submitted">Đã gửi</SelectItem>
            <SelectItem value="reviewed">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoadingReports ? (
        <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>
      ) : filteredReports.length === 0 ? (
        <div className="flex items-center justify-center h-64 flex-col">
          <p className="text-lg text-gray-500 mb-4">Không có báo cáo nào</p>
          <Button onClick={() => router.push('/teacherdashboard/assignments')}>
            Xem nhiệm vụ để báo cáo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Báo cáo: {report.plan_name} - {report.stage_name}
                    </CardTitle>
                    <CardDescription>
                      Gửi ngày: {formatDate(report.submitted_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(report.report_status)}>
                    {report.report_status === 'submitted' ? 'Đã gửi' :
                     report.report_status === 'reviewed' ? 'Đã duyệt' : 'Từ chối'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium mb-1">Nội dung báo cáo:</h3>
                  <p className="text-gray-700 line-clamp-3">{report.report_content}</p>
                </div>

                {report.has_documents && report.documents && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-1">Tài liệu đính kèm:</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.documents.map(doc => (
                        <Badge key={doc.id} variant="outline" className="bg-gray-100">
                          {doc.document_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {report.report_status !== 'submitted' && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-1">Phản hồi từ Trưởng ban:</h3>
                    <p className="text-gray-700">
                      {report.review_comments || 'Không có phản hồi'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Duyệt ngày: {report.reviewed_at ? formatDate(report.reviewed_at) : 'N/A'}
                    </p>
                  </div>
                )}                <div className="flex justify-between items-center">
                  <div>
                    {report.has_documents && (
                      <span className="text-sm text-blue-600">
                        <i className="mr-1">📎</i>
                        Có tài liệu đính kèm
                      </span>
                    )}
                  </div>
                  <Button 
                    onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
