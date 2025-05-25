"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, FileText, Bell, LogOut, Calendar } from "lucide-react"

interface DashboardStats {
  activePlans: number
  totalTeachers: number
  pendingReports: number
  latestNotifications: number
}

export default function TruongBanDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activePlans: 0,
    totalTeachers: 0,
    pendingReports: 0,
    latestNotifications: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      } else {
        setError(data.message || "Không thể tải thông tin tổng quan")
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin tổng quan:", err)
      setError("Lỗi kết nối khi tải thông tin tổng quan")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;"
    router.push("/auth/login")
  }

  const navigateTo = (path: string) => {
    router.push(`/dashboard/truongban/${path}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Trưởng ban</h1>
                <p className="text-sm text-gray-500">Tổng quan hệ thống tuyển sinh</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo("users")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Quản lý Tài khoản</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-gray-500">Tổng số giáo viên</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo("plans")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Kế hoạch Tuyển sinh</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePlans}</div>
              <p className="text-xs text-gray-500">Kế hoạch đang diễn ra</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo("reports")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Báo cáo Chờ duyệt</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-gray-500">Báo cáo cần xử lý</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo("notifications")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Thông báo Mới</CardTitle>
              <Bell className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.latestNotifications}</div>
              <p className="text-xs text-gray-500">Thông báo chưa đọc</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => navigateTo("users/new")}
          >
            <Users className="h-6 w-6" />
            <span>Thêm Người dùng</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => navigateTo("plans/new")}
          >
            <Calendar className="h-6 w-6" />
            <span>Tạo Kế hoạch</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => navigateTo("notifications/new")}
          >
            <Bell className="h-6 w-6" />
            <span>Tạo Thông báo</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => navigateTo("documents")}
          >
            <FileText className="h-6 w-6" />
            <span>Quản lý Tài liệu</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 