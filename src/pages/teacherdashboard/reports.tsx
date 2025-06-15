"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"
import {
  Loader2,
  Filter,
  FileText,
  Calendar,
  MessageSquare,
  Paperclip,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

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
  documents?: Array<{
    id: string
    document_name: string
    file_path: string
    file_type: string
    file_size_kb: number
    uploaded_at: string
  }>
}

export default function TeacherReports() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user?.role === "GIAOVIEN") {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true)
      const response = await axios.get("/api/teacher/reports")
      setReports(response.data as Report[])
      setIsLoadingReports(false)
    } catch (error) {
      console.error("Error fetching reports:", error)
      setIsLoadingReports(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-indigo-200 text-indigo-800"
      case "reviewed":
        return "bg-green-200 text-green-800"
      case "rejected":
        return "bg-orange-200 text-orange-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "Đã gửi"
      case "reviewed":
        return "Đã duyệt"
      case "rejected":
        return "Từ chối"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const filteredReports =
    statusFilter === "all" ? reports : reports.filter((report) => report.report_status === statusFilter)

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

  const statusCounts = {
    all: reports.length,
    submitted: reports.filter((r) => r.report_status === "submitted").length,
    reviewed: reports.filter((r) => r.report_status === "reviewed").length,
    rejected: reports.filter((r) => r.report_status === "rejected").length,
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Báo cáo của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi các báo cáo đã gửi</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/teacherdashboard/assignments")}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo báo cáo
            </Button>
            <Button onClick={() => fetchReports()}>Làm mới dữ liệu</Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Tổng số báo cáo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{statusCounts.all}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Đã gửi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">{statusCounts.submitted}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Đã duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{statusCounts.reviewed}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Từ chối</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{statusCounts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
          <Filter className="h-5 w-5 text-gray-500" />
          <label className="font-medium text-gray-700">Lọc theo trạng thái:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({statusCounts.all})</SelectItem>
              <SelectItem value="submitted">Đã gửi ({statusCounts.submitted})</SelectItem>
              <SelectItem value="reviewed">Đã duyệt ({statusCounts.reviewed})</SelectItem>
              <SelectItem value="rejected">Từ chối ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoadingReports ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">Không có báo cáo nào</p>
              <p className="text-gray-500 mb-4">
                {statusFilter === "all" ? "Chưa có báo cáo nào được gửi" : "Không có báo cáo nào với trạng thái này"}
              </p>
              <Button onClick={() => router.push("/teacherdashboard/assignments")}>
                <Plus className="h-4 w-4 mr-2" />
                Xem nhiệm vụ để tạo báo cáo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Báo cáo: {report.plan_name} - {report.stage_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Gửi ngày: {formatDate(report.submitted_at)}</span>
                        </div>
                        {report.reviewed_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Duyệt ngày: {formatDate(report.reviewed_at)}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(report.report_status)} font-medium flex items-center gap-1`}>
                      {getStatusDisplay(report.report_status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Nội dung báo cáo:
                      </h3>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed bg-gray-50 p-3 rounded-lg">
                        {report.report_content}
                      </p>
                    </div>

                    {report.has_documents && report.documents && (
                      <div>
                        <h3 className="font-medium mb-2 text-gray-900 flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          Tài liệu đính kèm:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {report.documents.map((doc) => (
                            <Badge key={doc.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              📎 {doc.document_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.report_status !== "submitted" && (
                      <div className="p-4 rounded-lg border-l-4 border-l-indigo-500 bg-indigo-50">
                        <h3 className="font-medium mb-2 text-indigo-900 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Phản hồi từ Trưởng ban:
                        </h3>
                        <p className="text-indigo-800 leading-relaxed">
                          {report.review_comments || "Không có phản hồi"}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-4">
                        {report.has_documents && (
                          <span className="text-sm text-blue-600 flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            {report.documents?.length || 0} tài liệu đính kèm
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => router.push(`/teacherdashboard/reports/${report.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
