"use client"

import { TeacherLayout } from "@/components/teacher-layout"
import { Loader2, Filter, Search, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
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

export default function AssignmentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && user.role === "GIAOVIEN") {
      fetchAssignments()
    }
  }, [user, statusFilter])

  const fetchAssignments = async () => {
    try {
      setIsLoadingAssignments(true)
      const url = "/api/teacher/assignments"
      const params: Record<string, string> = {}

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      console.log("Fetching assignments with params:", params)
      const response = await axios.get(url, { params })
      console.log("Assignments response:", response.data)
      setAssignments(response.data as Assignment[])
      setIsLoadingAssignments(false)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setIsLoadingAssignments(false)
    }
  }

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      await axios.put("/api/teacher/assignments", {
        assignmentId,
        newStatus,
      })

      // Refetch the assignments to update the list
      fetchAssignments()
    } catch (error) {
      console.error("Error updating assignment status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nhiệm vụ của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi các nhiệm vụ được phân công</p>
          </div>
          <Button onClick={() => fetchAssignments()}>Làm mới</Button>
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
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-gray-50 border-b">
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
                      {assignment.status === "pending"
                        ? "Chờ xử lý"
                        : assignment.status === "in_progress"
                          ? "Đang thực hiện"
                          : assignment.status === "completed"
                            ? "Đã hoàn thành"
                            : "Đã hủy"}
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
                      <>
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
                      </>
                    )}

                    {assignment.status === "in_progress" && (
                      <>
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
                      </>
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
      </div>
    </TeacherLayout>
  )
}
