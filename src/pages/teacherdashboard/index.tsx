"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
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

const ITEMS_PER_PAGE = 10

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

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
      const response = await fetch("/api/teacher/dashboard", {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data as DashboardStats)
      } else {
        console.error("Failed to fetch dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoadingStats(false)
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

  // Pagination calculations
  const totalAssignments = stats?.recentAssignments?.length || 0
  const totalPages = Math.ceil(totalAssignments / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentAssignments = stats?.recentAssignments?.slice(startIndex, endIndex) || []

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
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Nhiệm vụ"
                value={stats?.assignments.total || 0}
                description="Tổng số nhiệm vụ"
                icon={<ClipboardList className="h-6 w-6" />}
                className="bg-gradient-to-br from-amber-50 to-amber-100/50"
              />
              <StatCard
                title="Báo cáo"
                value={stats?.reports.total || 0}
                description="Tổng số báo cáo"
                icon={<FileText className="h-6 w-6" />}
                className="bg-gradient-to-br from-amber-50 to-amber-100/50"
              />
              <StatCard
                title="Thông báo chưa đọc"
                value={stats?.unreadNotifications || 0}
                description="Cần xem xét"
                icon={<Bell className="h-6 w-6" />}
                className="bg-gradient-to-br from-amber-50 to-amber-100/50"
              />
              <StatCard
                title="Kế hoạch đang diễn ra"
                value={stats?.ongoingPlans || 0}
                description="Đang thực hiện"
                icon={<Calendar className="h-6 w-6" />}
                className="bg-gradient-to-br from-amber-50 to-amber-100/50"
              />
            </div>

            <div>
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-amber-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">Nhiệm vụ gần đây</CardTitle>
                      <CardDescription>Danh sách các nhiệm vụ mới nhất của bạn</CardDescription>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => router.push("/teacherdashboard/assignments")}
                      className="flex items-center"
                    >
                      Xem tất cả
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {currentAssignments.length > 0 ? (
                    <div className="divide-y">
                      {currentAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-4 hover:bg-amber-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{assignment.stage_name}</h3>
                                <Badge className={getStatusColor(assignment.status)}>
                                  {getStatusDisplay(assignment.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{assignment.assignment_details}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(assignment.assigned_at).toLocaleDateString("vi-VN")}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-amber-600 font-medium">{assignment.plan_name}</span>
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/teacherdashboard/assignments/${assignment.id}`)}
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-gray-500">Không có nhiệm vụ nào gần đây</p>
                    </div>
                  )}
                </CardContent>
                {totalPages > 1 && (
                  <div className="p-4 border-t bg-gradient-to-r from-amber-50 to-amber-100/50">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
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
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

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
