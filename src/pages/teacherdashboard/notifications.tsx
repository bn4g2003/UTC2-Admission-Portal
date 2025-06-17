"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"
import { Loader2, Bell, BellRing, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

type Notification = {
  id: string
  title: string
  content: string
  created_at: string
  created_by_name: string
  is_read: boolean
  read_at: string | null
}

const ITEMS_PER_PAGE = 10

export default function TeacherNotifications() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && user.role === "GIAOVIEN") {
      fetchNotifications()
    }
  }, [user])

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await fetch("/api/teacher/notifications", {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data as Notification[])
      } else {
        console.error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/teacher/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          notificationId: id,
        }),
      })

      if (response.ok) {        // Update the local state to mark this notification as read
        setNotifications(
          notifications.map((notification) =>
            notification.id === id ? { ...notification, is_read: true, read_at: new Date().toISOString() } : notification,
          ),
        )
      } else {
        console.error("Failed to mark notification as read")
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
  }

  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((notification) => !notification.is_read) : notifications

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex)

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

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <TeacherLayout unreadNotifications={unreadCount}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông báo của tôi</h1>
            <p className="text-gray-500 mt-1">
              Quản lý và theo dõi các thông báo từ hệ thống
              {unreadCount > 0 && <span className="text-red-600 font-medium"> • {unreadCount} thông báo chưa đọc</span>}
            </p>
          </div>
          <Button onClick={() => fetchNotifications()}>Làm mới</Button>
        </div>

        <div className="bg-white rounded-lg border p-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Tất cả ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Chưa đọc ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoadingNotifications ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {activeTab === "unread" ? (
                  <BellRing className="h-8 w-8 text-gray-400" />
                ) : (
                  <Bell className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {activeTab === "all" ? "Không có thông báo" : "Không có thông báo chưa đọc"}
              </p>
              <p className="text-gray-500">
                {activeTab === "all" ? "Chưa có thông báo nào được gửi đến bạn" : "Tất cả thông báo đã được đọc"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden transition-all duration-200 ${
                  !notification.is_read
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30 hover:shadow-md"
                    : "hover:shadow-sm"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.is_read && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Mới</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Từ: {notification.created_by_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </CardDescription>
                    </div>

                    {notification.is_read ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã đọc
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{notification.content}</div>

                  {notification.read_at && (
                    <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-gray-200">
                      Đã đọc lúc: {formatDate(notification.read_at)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} trong tổng số{" "}
                  {filteredNotifications.length} thông báo
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
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
                    className="flex items-center gap-1"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
