"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"
import { StatCard } from "@/components/stat-card"
import { ClipboardList, FileText, Bell, Calendar, ArrowRight, Loader2 } from "lucide-react"

type DashboardStats = {
  assignments: {
    total: number
    byStatus: Record<string, number>
  }
  reports: {
    total: number
    byStatus: Record<string, number>
  }
  recentAssignments: Array<{
    id: string
    assignment_details: string
    status: string
    assigned_at: string
    stage_name: string
    plan_name: string
  }>
  unreadNotifications: number
  ongoingPlans: number
}

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user?.role === "GIAOVIEN") {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await axios.get("/api/teacher/dashboard")
      setStats(response.data as DashboardStats)
      setIsLoadingStats(false)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setIsLoadingStats(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800"
      case "in_progress":
        return "bg-blue-200 text-blue-800"
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

  return (
    <TeacherLayout unreadNotifications={stats?.unreadNotifications || 0}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
            <p className="text-gray-500 mt-1">
              Xin chào, {user.name || "Giáo viên"}! Đây là tổng quan hoạt động của bạn.
            </p>
          </div>
          <div className="hidden md:block">
            <Button onClick={() => fetchDashboardStats()}>Làm mới dữ liệu</Button>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Nhiệm vụ"
              value={stats?.assignments.total || 0}
              description="Tổng số nhiệm vụ"
              icon={<ClipboardList className="h-5 w-5" />}
              iconColor="bg-blue-100 text-blue-600"
            >
              <div className="flex flex-wrap gap-2 mt-3">
                {stats &&
                  Object.entries(stats.assignments.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className={getStatusColor(status)}>
                      {getStatusDisplay(status)}: {count}
                    </Badge>
                  ))}
              </div>
            </StatCard>

            <StatCard
              title="Báo cáo"
              value={stats?.reports.total || 0}
              description="Tổng số báo cáo"
              icon={<FileText className="h-5 w-5" />}
              iconColor="bg-purple-100 text-purple-600"
            >
              <div className="flex flex-wrap gap-2 mt-3">
                {stats &&
                  Object.entries(stats.reports.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className={getStatusColor(status)}>
                      {getStatusDisplay(status)}: {count}
                    </Badge>
                  ))}
              </div>
            </StatCard>

            <StatCard
              title="Thông báo"
              value={stats?.unreadNotifications || 0}
              description="Thông báo chưa đọc"
              icon={<Bell className="h-5 w-5" />}
              iconColor="bg-yellow-100 text-yellow-600"
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 flex items-center justify-between"
                onClick={() => router.push("/teacherdashboard/notifications")}
              >
                Xem thông báo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </StatCard>

            <StatCard
              title="Kế hoạch tuyển sinh"
              value={stats?.ongoingPlans || 0}
              description="Kế hoạch đang diễn ra"
              icon={<Calendar className="h-5 w-5" />}
              iconColor="bg-green-100 text-green-600"
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 flex items-center justify-between"
                onClick={() => router.push("/teacherdashboard/enrollment-plans")}
              >
                Xem kế hoạch
                <ArrowRight className="h-4 w-4" />
              </Button>
            </StatCard>
          </div>
        )}

        <div>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Nhiệm vụ gần đây</CardTitle>
                  <CardDescription>Các nhiệm vụ được phân công gần đây nhất</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/teacherdashboard/assignments")}>
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentAssignments && stats.recentAssignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Kế hoạch</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Giai đoạn</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Chi tiết</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentAssignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">{assignment.plan_name}</td>
                          <td className="py-3 px-4">{assignment.stage_name}</td>
                          <td className="py-3 px-4">
                            {assignment.assignment_details.length > 50
                              ? `${assignment.assignment_details.substring(0, 50)}...`
                              : assignment.assignment_details}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(assignment.status)} font-medium`}>
                              {getStatusDisplay(assignment.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/teacherdashboard/assignments/${assignment.id}`)}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Không có nhiệm vụ nào gần đây</p>
                  <p className="text-sm mt-1">Các nhiệm vụ mới sẽ xuất hiện ở đây</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 py-6 text-base" onClick={() => router.push("/teacherdashboard/assignments")}>
            <ClipboardList className="mr-2 h-5 w-5" />
            Tất cả nhiệm vụ
          </Button>
          <Button className="flex-1 py-6 text-base" onClick={() => router.push("/teacherdashboard/reports")}>
            <FileText className="mr-2 h-5 w-5" />
            Báo cáo của tôi
          </Button>
        </div>
      </div>
    </TeacherLayout>
  )
}
