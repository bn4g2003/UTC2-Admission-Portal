"use client"

import { useRouter } from "next/router"
import { Button } from "@/components/ui/button2"
import { LayoutDashboard, ClipboardList, FileText, Bell, Calendar, User, LogOut, School, MessageCircle } from "lucide-react"
import axios from "axios"

interface TeacherSidebarProps {
  unreadNotifications?: number
  activeRoute?: string
}

export function TeacherSidebar({ unreadNotifications = 0, activeRoute = "" }: TeacherSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    {
      name: "Bảng điều khiển",
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard",
      exact: true,
    },
    {
      name: "Nhiệm vụ",
      icon: <ClipboardList className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/assignments",
    },
    {
      name: "Báo cáo",
      icon: <FileText className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/reports",
    },
    {
      name: "Tin nhắn",
      icon: <MessageCircle className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/chat",
    },
    {
      name: "Thông báo",
      icon: <Bell className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/notifications",
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    {
      name: "Kế hoạch tuyển sinh",
      icon: <Calendar className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/enrollment-plans",
    },
    {
      name: "Thông tin cá nhân",
      icon: <User className="mr-2 h-5 w-5" />,
      path: "/teacherdashboard/profile",
    },
  ]

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return router.pathname === path
    }
    return router.pathname.startsWith(path)
  }

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-amber-300 p-2 rounded-lg">
            <School className="h-6 w-6 text-amber-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Giáo viên</h2>
            <p className="text-xs text-gray-500">Hệ thống quản lý</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path, item.exact) ? "primary" : "secondary"}
              className="w-full justify-start text-base font-medium"
              onClick={() => router.push(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
