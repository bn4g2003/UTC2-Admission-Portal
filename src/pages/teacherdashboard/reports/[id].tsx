"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button } from "@/components/ui/button2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  FileText,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Paperclip,
  Target,
  BookOpen,
  Loader2,
} from "lucide-react"
import { useAuth } from "../../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"

type Document = {
  id: string
  document_name: string
  file_path: string
  file_type: string
  file_size_kb: number
  uploaded_at: string
  downloadUrl?: string
}

type Report = {
  id: string
  report_content: string
  has_documents: boolean
  submitted_at: string
  report_status: string
  reviewed_at: string | null
  review_comments: string | null
  assignment_id: string
  assignment_details: string
  assignment_status: string
  stage_name: string
  plan_name: string
  documents?: Document[]
}

export default function ReportDetails() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const { id } = router.query
  const [report, setReport] = useState<Report | null>(null)
  const [isLoadingReport, setIsLoadingReport] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "GIAOVIEN" && id) {
      fetchReportDetails()
    }
  }, [isAuthenticated, user, id])

  const fetchReportDetails = async () => {
    try {
      setIsLoadingReport(true)
      const response = await axios.get(`/api/teacher/report-details`, {
        params: { reportId: id },
      })
      setReport(response.data as Report)
      setIsLoadingReport(false)
    } catch (error: any) {
      console.error("Error fetching report details:", error)
      setError(error.response?.data?.message || "Có lỗi xảy ra khi tải thông tin báo cáo.")
      setIsLoadingReport(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {      case "submitted":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "reviewed":
        return "bg-green-50 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />
      case "reviewed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN")
  }

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== "GIAOVIEN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này. Trang này chỉ dành cho Giáo viên.</p>
          <Button onClick={() => router.push("/")}>Quay lại trang chủ</Button>
        </div>
      </div>
    )
  }

  if (isLoadingReport) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Đang tải thông tin báo cáo...</p>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  if (error) {
    return (
      <TeacherLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Lỗi
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/teacherdashboard/reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách báo cáo
            </Button>
          </CardContent>
        </Card>
      </TeacherLayout>
    )
  }

  if (!report) {
    return (
      <TeacherLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Không tìm thấy báo cáo
            </CardTitle>
            <CardDescription>Báo cáo không tồn tại hoặc bạn không có quyền truy cập.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/teacherdashboard/reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách báo cáo
            </Button>
          </CardContent>
        </Card>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/teacherdashboard/reports")}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết báo cáo</h1>
            <p className="text-gray-500 mt-1">Thông tin chi tiết và trạng thái báo cáo</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  {report.plan_name} - {report.stage_name}
                </CardTitle>
                <CardDescription className="text-base mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Gửi ngày: {formatDate(report.submitted_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Lúc: {formatTime(report.submitted_at)}</span>
                  </div>
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(report.report_status)} font-medium flex items-center gap-1`}>
                {getStatusIcon(report.report_status)}
                {report.report_status === "submitted"
                  ? "Đã gửi"
                  : report.report_status === "reviewed"
                    ? "Đã duyệt"
                    : "Từ chối"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Assignment Details */}
            <Card className="border-l-4 border-l-orange-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Chi tiết nhiệm vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.assignment_details}</p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Report Content */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Nội dung báo cáo
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.report_content}</p>
              </div>
            </div>

            {/* Documents */}
            {report.has_documents && report.documents && report.documents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-green-600" />
                  Tài liệu đính kèm ({report.documents.length})
                </h3>
                <div className="space-y-3">
                  {report.documents.map((doc) => (
                    <Card key={doc.id} className="border-l-4 border-l-green-400 hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              {doc.document_name}
                            </h4>
                            <div className="mt-1 text-sm text-gray-500 flex items-center gap-4">
                              <span>{doc.file_type}</span>
                              <span>{formatFileSize(doc.file_size_kb)}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Tải lên ngày {formatDate(doc.uploaded_at)}</span>
                              </div>
                            </div>
                          </div>
                          {doc.downloadUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.downloadUrl, "_blank")}
                              className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              <Download className="h-4 w-4" />
                              Tải xuống
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Review Comments */}
            {report.report_status !== "submitted" && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Phản hồi từ Trưởng ban
                  </h3>
                  <Card
                    className={`border-l-4 ${
                      report.report_status === "reviewed" ? "border-l-green-400" : "border-l-red-400"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div
                        className={`p-4 rounded-lg ${
                          report.report_status === "reviewed"
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {report.review_comments ? (
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.review_comments}</p>
                        ) : (
                          <p className="text-gray-500 italic flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Không có phản hồi
                          </p>
                        )}
                      </div>
                      {report.reviewed_at && (
                        <div className="mt-3 text-sm text-gray-600 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Phản hồi ngày: {formatDate(report.reviewed_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Lúc: {formatTime(report.reviewed_at)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/teacherdashboard/assignments/${report.assignment_id}`)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Xem nhiệm vụ liên quan
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/teacherdashboard/reports")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Tất cả báo cáo
              </Button>
              {report.report_status === "submitted" && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${report.assignment_id}`)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Cập nhật báo cáo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
