"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  Users,
  GraduationCap,
  ClipboardList,
  Bell,
  FileText,
  FolderOpen,
  MessageCircle,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  Settings,
  Home,
  LogOut,
  User,
} from "lucide-react"
import GoogleTrendsCharts from "@/components/GoogleTrendsCharts"

interface MenuItem {
  title: string
  description: string
  path: string
  icon: React.ComponentType<any>
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    title: "Tổng quan",
    description: "Dashboard chính",
    path: "/dashboard",
    icon: Home,
  },
  {
    title: "Quản lý Người dùng",
    description: "Quản lý tài khoản và phân quyền",
    path: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Kế hoạch Tuyển sinh",
    description: "Quản lý kế hoạch tuyển sinh",
    path: "/dashboard/enrollment-plans",
    icon: GraduationCap,
  },
  {
    title: "Phân công Nhiệm vụ",
    description: "Phân công và theo dõi công việc",
    path: "/dashboard/assignments",
    icon: ClipboardList,
  },
  {
    title: "Thông báo",
    description: "Quản lý thông báo hệ thống",
    path: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Báo cáo",
    description: "Báo cáo và thống kê",
    path: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Tài liệu",
    description: "Quản lý tài liệu",
    path: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "Chat Nội bộ",
    description: "Trao đổi nội bộ",
    path: "/dashboard/chat",
    icon: MessageCircle,
  },
]

function AppSidebar() {
  const router = useRouter()

  const handleLogout = () => {
    // Add logout logic here
    router.push("/login")
  }

  const handleSettings = () => {
    router.push("/dashboard/settings")
  }

  const handleProfile = () => {
    router.push("/dashboard/profile")
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">UTC2 Dashboard</h2>
            <p className="text-xs text-muted-foreground">Trưởng Ban</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chức năng chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => router.push(item.path)} className="w-full justify-start">
                      <IconComponent className="w-4 h-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSettings}>
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleProfile}>
              <User className="w-4 h-4" />
              <span>Hồ sơ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("")
  const [currentTime, setCurrentTime] = useState<string>("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlans: 0,
    pendingAssignments: 0,
    pendingReports: 0
  })
  const router = useRouter()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        })
        const data = await response.json()

        if (!response.ok || data.role !== "TRUONGBAN") {
          router.push("/login")
          return
        }

        setUserName(data.email)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            <Badge variant="outline" className="hidden sm:flex">
              {currentTime}
            </Badge>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Chào mừng trở lại! 👋</h1>
              <p className="text-muted-foreground">
                Xin chào {userName || "Trưởng Ban"}, đây là tổng quan hoạt động hệ thống UTC2.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                  <CardTitle className="text-sm font-medium ">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kế hoạch hoạt động</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePlans}</div>
                  <p className="text-xs text-muted-foreground">Kế hoạch đang triển khai</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nhiệm vụ chờ</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Nhiệm vụ cần xử lý</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Báo cáo chờ duyệt</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReports}</div>
                  <p className="text-xs text-muted-foreground">Báo cáo cần xem xét</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard/users/new")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Thêm người dùng mới</h3>
                        <p className="text-sm text-muted-foreground">Tạo tài khoản mới</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard/assignments/new")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Tạo nhiệm vụ mới</h3>
                        <p className="text-sm text-muted-foreground">Phân công công việc</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard/notifications/new")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Gửi thông báo</h3>
                        <p className="text-sm text-muted-foreground">Thông báo toàn hệ thống</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Google Trends Section */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Phân tích xu hướng tìm kiếm</h2>
              </div>
              <GoogleTrendsCharts />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
