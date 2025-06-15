import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button } from '@/components/ui/button2';
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
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo báo cáo mới</h1>
          <p className="text-gray-500">Điền thông tin báo cáo cho nhiệm vụ của bạn</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}            className="hover:bg-amber-50 transition-colors"
        >
          Quay lại
        </Button>
      </div>

      <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Thông tin nhiệm vụ</CardTitle>
          <CardDescription className="text-base">
            {assignment.plan_name} - {assignment.stage_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Chi tiết nhiệm vụ:
            </Label>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
              {assignment.assignment_details}
            </p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Trạng thái:
            </Label>
            <Badge className={`              ${assignment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                assignment.status === 'in_progress' ? 'bg-amber-200 text-amber-900' :
                assignment.status === 'completed' ? 'bg-amber-300 text-amber-900' : 
                'bg-red-100 text-red-800'}
              px-3 py-1 text-sm font-medium rounded-full
            `}>
              {assignment.status === 'pending' ? 'Chờ xử lý' :
               assignment.status === 'in_progress' ? 'Đang thực hiện' :
               assignment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Nội dung báo cáo</CardTitle>
          <CardDescription className="text-base">
            Nhập chi tiết báo cáo về nhiệm vụ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label 
                htmlFor="reportContent" 
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Nội dung báo cáo
              </Label>
              <Textarea
                id="reportContent"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Nhập nội dung báo cáo chi tiết về nhiệm vụ được giao..."
                rows={8}
                className="w-full resize-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>{/* File upload functionality */}            <div className="space-y-4">
              <Label 
                htmlFor="fileUpload" 
                className="text-sm font-semibold text-gray-700 block"
              >
                Tài liệu đính kèm
              </Label>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="fileUpload"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="fileUpload"
                      className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 
                              rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors"
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          Nhấn để tải lên tài liệu
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PDF, DOC, DOCX hoặc các định dạng văn bản khác
                        </p>
                      </div>
                    </label>
                  </div>
                  {isUploading && (
                    <div className="flex items-center text-sm text-amber-600">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Đang tải lên...
                    </div>
                  )}
                </div>
                
                {uploadError && (
                  <Alert variant="destructive" className="bg-red-50 text-red-800 border border-red-200">
                    <AlertDescription>
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Đã tải lên {uploadedFiles.length} tài liệu:
                    </h3>
                    <ul className="space-y-3">
                      {uploadedFiles.map((file) => (
                        <li 
                          key={file.id} 
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 
                                   shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-700">
                              {file.document_name}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({(file.file_size_kb / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeFile(file.id)}
                            className="text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
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
              <Alert 
                variant="destructive" 
                className="bg-red-50 text-red-800 border border-red-200 my-6"
              >
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[150px] font-medium bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Đang gửi...</span>
                  </div>
                ) : 'Gửi báo cáo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
