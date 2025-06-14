import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { useAuth } from '../../../../hooks/use-auth';

type Document = {
  id: string;
  document_name: string;
  file_path: string;
  file_type: string;
  file_size_kb: number;
  uploaded_at: string;
  downloadUrl?: string;
};

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
  documents?: Document[];
};

export default function ReportDetails() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'GIAOVIEN' && id) {
      fetchReportDetails();
    }
  }, [isAuthenticated, user, id]);

  const fetchReportDetails = async () => {
    try {
      setIsLoadingReport(true);
      const response = await axios.get(`/api/teacher/report-details`, {
        params: { reportId: id }
      });
      setReport(response.data as Report);
      setIsLoadingReport(false);
    } catch (error: any) {
      console.error('Error fetching report details:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin báo cáo.');
      setIsLoadingReport(false);
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
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN');
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (user?.role !== 'GIAOVIEN') {
    return <div className="flex items-center justify-center min-h-screen">
      Bạn không có quyền truy cập trang này. Trang này chỉ dành cho Giáo viên.
    </div>;
  }

  if (isLoadingReport) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      Đang tải thông tin báo cáo...
    </div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/teacherdashboard/reports')}>
            Quay lại danh sách báo cáo
          </Button>
        </CardContent>
      </Card>
    </div>;
  }

  if (!report) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Không tìm thấy báo cáo</CardTitle>
          <CardDescription>Báo cáo không tồn tại hoặc bạn không có quyền truy cập.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/teacherdashboard/reports')}>
            Quay lại danh sách báo cáo
          </Button>
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chi tiết báo cáo</h1>
        <Button variant="outline" onClick={() => router.push('/teacherdashboard/reports')}>
          Quay lại danh sách
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{report.plan_name} - {report.stage_name}</CardTitle>
              <CardDescription>
                Gửi ngày: {formatDate(report.submitted_at)} lúc {formatTime(report.submitted_at)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(report.report_status)}>
              {report.report_status === 'submitted' ? 'Đã gửi' :
               report.report_status === 'reviewed' ? 'Đã duyệt' : 'Từ chối'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Chi tiết nhiệm vụ</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{report.assignment_details}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Nội dung báo cáo</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-700 whitespace-pre-wrap">{report.report_content}</p>
            </div>
          </div>

          {report.has_documents && report.documents && report.documents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Tài liệu đính kèm</h3>
              <div className="space-y-2">
                {report.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.file_type} • {(doc.file_size_kb / 1024).toFixed(2)} MB • 
                        Tải lên ngày {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                    {doc.downloadUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(doc.downloadUrl, '_blank')}
                        className="flex items-center"
                      >
                        <Download size={16} className="mr-2" />
                        Tải xuống
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.report_status !== 'submitted' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-2">Phản hồi từ Trưởng ban</h3>
              <div className="bg-gray-50 p-4 rounded border">
                {report.review_comments ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{report.review_comments}</p>
                ) : (
                  <p className="text-gray-500 italic">Không có phản hồi</p>
                )}
              </div>
              {report.reviewed_at && (
                <p className="text-sm text-gray-500 mt-2">
                  Phản hồi ngày: {formatDate(report.reviewed_at)} lúc {formatTime(report.reviewed_at)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
