"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "../../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"
import {
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Paperclip,
  Loader2,
  ArrowLeft,
  Play,
  Check,
  Download,
  MessageSquare,
  Building,
  Target,
  BookOpen,
} from "lucide-react"

type Assignment = {
  id: string
  assignment_details: string
  status: string
  assigned_at: string
  completed_at: string | null
  notes: string | null
  stage_id: string
  stage_name: string
  stage_description: string
  start_time: string
  end_time: string
  stage_order: number
  plan_id: string
  plan_name: string
  year_start: string
  plan_description: string
  plan_start_date: string
  plan_end_date: string
  plan_status: string
  stage_status: string
  assigned_to: {
    id: string
    full_name: string
    email: string
    phone: string
    department: string
  }
  reports: {
    id: string
    report_content: string
    has_documents: boolean
    submitted_at: string
    report_status: string
    reviewed_at: string | null
    review_comments: string | null
    documents?: {
      downloadUrl: any
      error?: string
      id: string
      document_name: string
      file_path: string
      file_type: string
      file_size_kb: number
      uploaded_at: string
    }[]
  }[]
}

export default function AssignmentDetails() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { id } = router.query

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loadingAssignment, setLoadingAssignment] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && user.role === "GIAOVIEN" && id) {
      fetchAssignmentDetails()
    }
  }, [user, id])

  const fetchAssignmentDetails = async () => {
    try {
      setLoadingAssignment(true)
      setError(null)

      console.log("Fetching assignment details for ID:", id)
      const response = await axios.get("/api/teacher/assignment-details", {
        params: { assignmentId: id },
      })

      console.log("Assignment details response:", response.status)
      setAssignment(response.data as Assignment)
      setLoadingAssignment(false)
    } catch (error: any) {
      console.error("Error fetching assignment details:", error)
      const errorMessage = error.response?.data?.message || "Không thể tải thông tin nhiệm vụ."
      const errorDetails = error.response?.data?.error || ""

      setError(`${errorMessage}${errorDetails ? ` - Chi tiết: ${errorDetails}` : ""}`)
      setLoadingAssignment(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put("/api/teacher/assignments", {
        assignmentId: id,
        newStatus,
      })

      // Refetch the assignment to update the displayed data
      fetchAssignmentDetails()
    } catch (error) {
      console.error("Error updating assignment status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"      
      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStageStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sắp_diễn_ra":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "đang_diễn_ra":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "hoàn_thành":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getReportStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "đã_gửi":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Chờ duyệt
          </Badge>
        )
      case "đã_duyệt":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã duyệt
          </Badge>
        )
      case "từ_chối":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Từ chối
          </Badge>
        )
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`
    }
  }

  if (isLoading || !user) {
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

  if (loadingAssignment) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Đang tải thông tin nhiệm vụ...</p>
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
            <Button onClick={() => router.push("/teacherdashboard/assignments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách nhiệm vụ
            </Button>
          </CardContent>
        </Card>
      </TeacherLayout>
    )
  }

  if (!assignment) {
    return (
      <TeacherLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Không tìm thấy
            </CardTitle>
            <CardDescription>Không tìm thấy thông tin nhiệm vụ được yêu cầu.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/teacherdashboard/assignments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách nhiệm vụ
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
              onClick={() => router.push("/teacherdashboard/assignments")}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết Nhiệm vụ</h1>
            <p className="text-gray-500 mt-1">Thông tin chi tiết và trạng thái nhiệm vụ</p>
          </div>
        </div>

        {/* Assignment Information */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  {assignment.plan_name}
                </CardTitle>
                <CardDescription className="text-base mt-1 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Giai đoạn: {assignment.stage_name}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`${getStatusColor(assignment.status)} font-medium flex items-center gap-1`}>
                  {assignment.status === "pending" ? (
                    <Clock className="w-3 h-3" />
                  ) : assignment.status === "in_progress" ? (
                    <Play className="w-3 h-3" />
                  ) : assignment.status === "completed" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {assignment.status === "pending"
                    ? "Chờ xử lý"
                    : assignment.status === "in_progress"
                      ? "Đang thực hiện"
                      : assignment.status === "completed"
                        ? "Đã hoàn thành"
                        : "Đã hủy"}
                </Badge>
                <Badge className={`${getStageStatusColor(assignment.stage_status)} font-medium`}>
                  Giai đoạn:{" "}
                  {assignment.stage_status === "sắp_diễn_ra"
                    ? "Sắp diễn ra"
                    : assignment.stage_status === "đang_diễn_ra"
                      ? "Đang diễn ra"
                      : "Đã kết thúc"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Chi tiết nhiệm vụ
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{assignment.assignment_details}</p>
              </div>
              {assignment.notes && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Ghi chú:
                  </h4>
                  <p className="text-blue-800">{assignment.notes}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-green-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    Thông tin Kế hoạch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium min-w-[80px]">Kế hoạch:</span>
                    <span className="font-medium">
                      {assignment.plan_name} ({assignment.year_start})
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium min-w-[80px]">Mô tả:</span>
                    <span className="flex-1 text-gray-700">{assignment.plan_description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500 font-medium">Thời gian:</span>
                    <span>
                      {formatDate(assignment.plan_start_date)} - {formatDate(assignment.plan_end_date)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Thông tin Giai đoạn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium min-w-[80px]">Giai đoạn:</span>
                    <span className="font-medium">
                      {assignment.stage_name} (Thứ tự: {assignment.stage_order})
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium min-w-[80px]">Mô tả:</span>
                    <span className="flex-1 text-gray-700">{assignment.stage_description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500 font-medium">Thời gian:</span>
                    <span>
                      {formatDate(assignment.start_time)} - {formatDate(assignment.end_time)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <Card className="border-l-4 border-l-blue-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin Phân công
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 font-medium min-w-[140px]">Được phân công cho:</span>
                  <span className="font-medium">{assignment.assigned_to.full_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 font-medium min-w-[140px]">Ngày phân công:</span>
                  <span>{formatDateTime(assignment.assigned_at)}</span>
                </div>
                {assignment.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-500 font-medium min-w-[140px]">Ngày hoàn thành:</span>
                    <span className="text-green-700 font-medium">{formatDateTime(assignment.completed_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-4 border-t bg-gray-50">
            {assignment.status === "pending" && (
              <Button onClick={() => handleStatusChange("in_progress")} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Bắt đầu thực hiện
              </Button>
            )}

            {assignment.status === "in_progress" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("completed")}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Đánh dấu hoàn thành
              </Button>
            )}

            {(assignment.status === "in_progress" || assignment.status === "completed") && (
              <Button
                onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Gửi báo cáo
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Reports Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Báo cáo đã gửi
          </h2>

          {assignment.reports && assignment.reports.length > 0 ? (
            <div className="space-y-4">
              {assignment.reports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-gray-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Báo cáo ngày {formatDate(report.submitted_at)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          Gửi lúc: {formatDateTime(report.submitted_at)}
                        </CardDescription>
                      </div>
                      {getReportStatusBadge(report.report_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          Nội dung báo cáo:
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.report_content}</p>
                        </div>
                      </div>

                      {report.has_documents && report.documents && report.documents.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-gray-600" />
                            Tài liệu đính kèm:
                          </h4>
                          <div className="space-y-2">
                            {report.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-white border rounded-lg p-3 flex justify-between items-center hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{doc.document_name}</p>
                                  <p className="text-sm text-gray-500">
                                    {doc.file_type} • {formatFileSize(doc.file_size_kb)} • Tải lên ngày{" "}
                                    {formatDate(doc.uploaded_at)}
                                  </p>
                                </div>
                                {doc.downloadUrl ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.downloadUrl, "_blank")}
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Tải xuống
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                                    title={doc.error ? `Không thể tạo URL: ${doc.error}` : "Xem chi tiết báo cáo"}
                                    className="flex items-center gap-2"
                                  >
                                    {doc.error ? (
                                      <>
                                        <XCircle className="h-4 w-4" />
                                        Lỗi tải xuống
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-4 w-4" />
                                        Xem chi tiết
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.review_comments && (
                        <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                          <h4 className="font-medium mb-2 text-indigo-900 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Phản hồi của Trưởng ban:
                          </h4>
                          <p className="text-indigo-800 whitespace-pre-wrap leading-relaxed">
                            {report.review_comments}
                          </p>
                          <p className="text-sm text-indigo-600 mt-2">
                            {report.reviewed_at && `Duyệt ngày ${formatDateTime(report.reviewed_at)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 bg-gray-50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Xem chi tiết báo cáo
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4 text-lg">Chưa có báo cáo nào cho nhiệm vụ này.</p>
                {(assignment.status === "in_progress" || assignment.status === "completed") && (
                  <Button
                    onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Gửi báo cáo mới
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}
