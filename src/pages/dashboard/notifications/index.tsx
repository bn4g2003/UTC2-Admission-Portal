"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppSidebar from "@/components/app-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  BarChart3,
  Settings,
  Home,
  LogOut,
  Plus,
  Trash2,
  ArrowLeft,
  User,
  Megaphone,
  Clock,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  Sparkles,
} from "lucide-react"

interface Notification {
  id: string
  title: string
  content: string
  created_at: string
  created_by_name: string
  created_by_email: string
  priority?: "low" | "medium" | "high" | "urgent"
}

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddNotificationOpen, setIsAddNotificationOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  })

  const router = useRouter()
  const userRole = "TRUONGBAN" // Mock user role - replace with actual auth

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      // Sort notifications by created_at descending to get latest first
      const sortedData = data.sort(
        (a: Notification, b: Notification) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setNotifications(sortedData)
    } catch (err) {
      setError("Không thể tải danh sách thông báo")
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newNotification.title || !newNotification.content) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newNotification),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add notification")
      }

      await fetchNotifications()
      setIsAddNotificationOpen(false)
      setNewNotification({
        title: "",
        content: "",
        priority: "medium",
      })
    } catch (err: any) {
      setError(err.message || "Không thể tạo thông báo mới")
      console.error("Error adding notification:", err)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete notification")
      }

      await fetchNotifications()
    } catch (err: any) {
      setError(err.message || "Không thể xóa thông báo")
      console.error("Error deleting notification:", err)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeAgo = (dateTimeString: string) => {
    const now = new Date()
    const notificationTime = new Date(dateTimeString)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Khẩn cấp
          </Badge>
        )
      case "high":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Cao
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Trung bình
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Thấp
          </Badge>
        )
      default:
        return null
    }
  }

  const isLatestNotification = (index: number) => index === 0 && notifications.length > 0

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Dashboard</span>
            </Button> */}
            <div className="flex-1" />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Quản lý Thông báo</h1>
                    <p className="text-muted-foreground">Tạo và quản lý thông báo hệ thống cho toàn bộ giảng viên</p>
                  </div>
                  {userRole === "TRUONGBAN" && (
                    <Dialog open={isAddNotificationOpen} onOpenChange={setIsAddNotificationOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Tạo thông báo mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Tạo Thông báo Mới</DialogTitle>
                          <DialogDescription>
                            Tạo thông báo mới để gửi đến tất cả giảng viên trong hệ thống.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddNotification}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="title">Tiêu đề thông báo</Label>
                              <Input
                                id="title"
                                value={newNotification.title}
                                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                placeholder="Nhập tiêu đề thông báo..."
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="priority">Mức độ ưu tiên</Label>
                              <select
                                id="priority"
                                value={newNotification.priority}
                                onChange={(e) =>
                                  setNewNotification({
                                    ...newNotification,
                                    priority: e.target.value as "low" | "medium" | "high" | "urgent",
                                  })
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="low">Thấp</option>
                                <option value="medium">Trung bình</option>
                                <option value="high">Cao</option>
                                <option value="urgent">Khẩn cấp</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="content">Nội dung thông báo</Label>
                              <Textarea
                                id="content"
                                value={newNotification.content}
                                onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                                placeholder="Nhập nội dung chi tiết thông báo..."
                                rows={5}
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Tạo thông báo</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-r  from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng thông báo</CardTitle>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notifications.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Thông báo hôm nay</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          notifications.filter((n) => {
                            const today = new Date()
                            const notificationDate = new Date(n.created_at)
                            return notificationDate.toDateString() === today.toDateString()
                          }).length
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Thông báo khẩn cấp</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {notifications.filter((n) => n.priority === "urgent").length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Latest Notification Highlight */}
                {notifications.length > 0 && (
                  <Card className="mb-8 border-2 border-primary bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        Thông báo mới nhất
                        <Badge variant="default" className="ml-2">
                          MỚI
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-primary mb-2">{notifications[0].title}</h3>
                            <p className="text-foreground leading-relaxed mb-3">{notifications[0].content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {notifications[0].created_by_name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {getTimeAgo(notifications[0].created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">{getPriorityBadge(notifications[0].priority || "medium")}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Tất cả thông báo ({notifications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tiêu đề</TableHead>
                          <TableHead>Nội dung</TableHead>
                          <TableHead>Mức độ</TableHead>
                          <TableHead>Người tạo</TableHead>
                          <TableHead>Thời gian</TableHead>
                          {userRole === "TRUONGBAN" && <TableHead className="text-right">Thao tác</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={userRole === "TRUONGBAN" ? 6 : 5} className="text-center py-8">
                              Chưa có thông báo nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          notifications.map((notification, index) => (
                            <TableRow
                              key={notification.id}
                              className={isLatestNotification(index) ? "bg-blue-50 border-l-4 border-l-primary" : ""}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {isLatestNotification(index) && <Sparkles className="w-4 h-4 text-primary" />}
                                  {notification.title}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="truncate" title={notification.content}>
                                  {notification.content}
                                </div>
                              </TableCell>
                              <TableCell>{getPriorityBadge(notification.priority || "medium")}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {notification.created_by_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{getTimeAgo(notification.created_at)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(notification.created_at)}
                                  </span>
                                </div>
                              </TableCell>
                              {userRole === "TRUONGBAN" && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
