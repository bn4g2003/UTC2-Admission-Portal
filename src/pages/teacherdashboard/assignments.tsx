"use client"

import { TeacherLayout } from "@/components/teacher-layout"
import { Loader2, Filter, Search, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "../../../hooks/use-auth"

type Assignment = {
  id: string
  assignment_details: string
  status: string
  assigned_at: string
  completed_at: string | null
  stage_id: string
  stage_name: string
  stage_description: string
  start_time: string
  end_time: string
  plan_id: string
  plan_name: string
}

const ITEMS_PER_PAGE = 10

export default function AssignmentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && user.role === "GIAOVIEN") {
      fetchAssignments()
    }
  }, [user, statusFilter, currentPage])
  const fetchAssignments = async () => {
    try {
      setIsLoadingAssignments(true)
      const url = "/api/teacher/assignments"
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      console.log("Fetching assignments with params:", params.toString())
      const response = await fetch(`${url}?${params}`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Assignments response:", data)
        setAssignments(data as Assignment[])
      } else {
        console.error("Failed to fetch assignments")
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          assignmentId,
          newStatus,
        }),
      })

      if (response.ok) {
        // Refetch the assignments to update the list
        fetchAssignments()
      } else {
        console.error("Failed to update assignment status")
      }
    } catch (error) {
      console.error("Error updating assignment status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800"
      case "in_progress":
        return "bg-amber-200 text-amber-800"
      case "completed":
        return "bg-green-200 text-green-800"
      case "cancelled":
        return "bg-red-200 text-red-800"
      case "submitted":
        return "bg-indigo-200 text-indigo-800"
      case "reviewed":
        return "bg-purple-200 text-purple-800"
      case "rejected":
        return "bg-orange-200 text-orange-800"
      case "đã_gửi":
        return "bg-indigo-200 text-indigo-800"
      case "đã_duyệt":
        return "bg-purple-200 text-purple-800"
      case "từ_chối":
        return "bg-orange-200 text-orange-800"
      case "sắp_diễn_ra":
        return "bg-purple-200 text-purple-800"
      case "đang_diễn_ra":
        return "bg-blue-200 text-blue-800"
      case "hoàn_thành":
        return "bg-green-200 text-green-800"
      case "hoạt_động":
        return "bg-green-200 text-green-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xử lý"
      case "in_progress":
        return "Đang thực hiện"
      case "completed":
        return "Đã hoàn thành"
      case "cancelled":
        return "Đã hủy"
      case "submitted":
        return "Đã gửi"
      case "reviewed":
        return "Đã duyệt"
      case "rejected":
        return "Từ chối"
      case "đã_gửi":
        return "Đã gửi"
      case "đã_duyệt":
        return "Đã duyệt"
      case "từ_chối":
        return "Từ chối"
      case "sắp_diễn_ra":
        return "Sắp diễn ra"
      case "đang_diễn_ra":
        return "Đang diễn ra"
      case "hoàn_thành":
        return "Đã hoàn thành"
      case "hoạt_động":
        return "Đang hoạt động"
      default:
        return status
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Pagination calculations
  const totalAssignments = assignments.length
  const totalPages = Math.ceil(totalAssignments / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentAssignments = assignments.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nhiệm vụ của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi các nhiệm vụ được phân công</p>
          </div>
          <Button onClick={() => fetchAssignments()}>Làm mới dữ liệu</Button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
          <Filter className="h-5 w-5 text-gray-500" />
          <label className="font-medium text-gray-700">Lọc theo trạng thái:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
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
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy nhiệm vụ nào</p>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc kiểm tra lại sau</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{assignment.plan_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {assignment.stage_name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(assignment.start_time)} - {formatDate(assignment.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Giao ngày: {formatDate(assignment.assigned_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(assignment.status)} font-medium`}>
                      {getStatusDisplay(assignment.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-gray-900">Chi tiết nhiệm vụ:</h3>
                    <p className="text-gray-700 leading-relaxed">{assignment.assignment_details}</p>
                  </div>

                  {assignment.completed_at && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Hoàn thành ngày: {formatDate(assignment.completed_at)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    {assignment.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(assignment.id, "in_progress")}
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        title={new Date(assignment.start_time) > new Date() 
                          ? `Nhiệm vụ sẽ bắt đầu vào ${formatDate(assignment.start_time)}`
                          : "Bắt đầu thực hiện nhiệm vụ"}
                      >
                        Bắt đầu thực hiện
                        {new Date(assignment.start_time) > new Date() && (
                          <span className="ml-1 text-xs">({formatDate(assignment.start_time)})</span>
                        )}
                      </Button>
                    )}

                    {assignment.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(assignment.id, "completed")}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        title={`Hạn nộp: ${formatDate(assignment.end_time)}`}
                      >
                        Đánh dấu hoàn thành
                        {new Date(assignment.end_time) < new Date() && (
                          <span className="ml-1 text-xs text-red-600">(Đã quá hạn)</span>
                        )}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/teacherdashboard/assignments/${assignment.id}`)}
                    >
                      Chi tiết
                    </Button>

                    {(assignment.status === "in_progress" || assignment.status === "completed") && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/teacherdashboard/reports/create?assignmentId=${assignment.id}`)}
                      >
                        Gửi báo cáo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gradient-to-r from-amber-50 to-amber-100/50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="whitespace-nowrap"
              >
                Trước
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="whitespace-nowrap"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
