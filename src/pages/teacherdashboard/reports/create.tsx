import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../../../hooks/use-auth';

type Assignment = {
  id: string;
  assignment_details: string;
  status: string;
  stage_id: string;
  stage_name: string;
  plan_id: string;
  plan_name: string;
};

type UploadedDocument = {
  id: string;
  document_name: string;
  file_path: string;
  file_type: string;
  file_size_kb: number;
  uploaded_at: string;
};

export default function CreateReport() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const { assignmentId } = router.query;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'GIAOVIEN' && assignmentId) {
      fetchAssignmentDetails();
    }
  }, [isAuthenticated, user, assignmentId]);
  const fetchAssignmentDetails = async () => {
    try {
      setIsLoadingAssignment(true);
      const response = await axios.get(`/api/teacher/assignment-details`, {
        params: { assignmentId }
      });
      
      if (response.data && Object.keys(response.data).length > 0) {
        setAssignment(response.data as Assignment);
      } else {
        setAssignment(null);
      }
      setIsLoadingAssignment(false);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setIsLoadingAssignment(false);
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    const file = files[0];
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // Remove the data:image/jpeg;base64, part
      const base64Data = base64.split(',')[1];
      
      const response = await axios.post('/api/documents/upload', {
        file: base64Data,
        fileName: file.name,
        fileType: file.type
      });

      const data = response.data as { document: UploadedDocument };
      setUploadedFiles(prev => [...prev, data.document]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lên tài liệu.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportContent.trim()) {
      setErrorMessage('Vui lòng nhập nội dung báo cáo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const documentIds = uploadedFiles.map(file => file.id);
      
      const response = await axios.post('/api/teacher/reports', {
        assignmentId,
        reportContent,
        documentIds: documentIds.length > 0 ? documentIds : undefined
      });

      if (response.status === 201) {
        router.push('/teacherdashboard/reports');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (user?.role !== 'GIAOVIEN') {
    return <div className="flex items-center justify-center min-h-screen">
      Bạn không có quyền truy cập trang này. Trang này chỉ dành cho Giáo viên.
    </div>;
  }

  if (isLoadingAssignment) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      Đang tải thông tin nhiệm vụ...
    </div>;
  }

  if (!assignment) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Không tìm thấy nhiệm vụ</CardTitle>
          <CardDescription>Nhiệm vụ không tồn tại hoặc bạn không có quyền truy cập.</CardDescription>
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
        <h1 className="text-2xl font-bold">Tạo báo cáo mới</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin nhiệm vụ</CardTitle>
          <CardDescription>{assignment.plan_name} - {assignment.stage_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="font-medium mb-1 block">Chi tiết nhiệm vụ:</Label>
            <p className="text-gray-700">{assignment.assignment_details}</p>
          </div>
          <div>
            <Label className="font-medium mb-1 block">Trạng thái:</Label>
            <Badge>
              {assignment.status === 'pending' ? 'Chờ xử lý' :
               assignment.status === 'in_progress' ? 'Đang thực hiện' :
               assignment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung báo cáo</CardTitle>
          <CardDescription>Nhập chi tiết báo cáo về nhiệm vụ của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="reportContent" className="block mb-2">
                Nội dung báo cáo
              </Label>
              <Textarea
                id="reportContent"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Nhập nội dung báo cáo chi tiết về nhiệm vụ được giao..."
                rows={8}
                className="w-full"
              />
            </div>            {/* File upload functionality */}
            <div className="mb-6">
              <Label htmlFor="fileUpload" className="block mb-2">
                Tài liệu đính kèm
              </Label>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="fileUpload"
                    className="mr-4 flex-1 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary 
                              file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground
                              hover:file:bg-primary/80"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <span className="text-sm text-gray-500">Đang tải lên...</span>
                  )}
                </div>
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Đã tải lên {uploadedFiles.length} tài liệu:</h3>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <li key={file.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{file.document_name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({(file.file_size_kb / 1024).toFixed(2)} MB)
                            </span>
                          </div>                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
