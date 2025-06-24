"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  Users,
  GraduationCap,
  ClipboardList,
  Bell,
  FileText,
  FolderOpen,
  BarChart3,
  Home,
  LogOut,
  ChevronRight,
  MessageCircle,
} from "lucide-react"
import { cn } from "../../lib/utils"

const menuItems = [
  { title: "Tổng quan", path: "/dashboard", icon: Home },
  { title: "Quản lý Người dùng", path: "/dashboard/users", icon: Users },
  { title: "Kế hoạch Tuyển sinh", path: "/dashboard/enrollment-plans", icon: GraduationCap },
  { title: "Phân công Nhiệm vụ", path: "/dashboard/assignments", icon: ClipboardList },
  { title: "Tin nhắn", path: "/dashboard/chat", icon: MessageCircle },
  { title: "Thông báo", path: "/dashboard/notifications", icon: Bell },
  { title: "Báo cáo", path: "/dashboard/reports", icon: FileText },
  { title: "Tài liệu", path: "/dashboard/documents", icon: FolderOpen },
]

export default function AppSidebar() {  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Gọi API để xóa cookie token
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Lỗi khi đăng xuất');
      }

      // Chuyển hướng người dùng đến trang đăng nhập
      router.push("/auth/login");
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Vẫn điều hướng đến trang đăng nhập ngay cả khi có lỗi
      router.push("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(path)
  }

  return (
    <Sidebar className="border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white overflow-hidden">
              <img src="/images/login2.png" alt="Trưởng Ban" className="w-10 h-10 object-cover rounded-xl" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">UTC2 Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Trưởng Ban</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Chức năng chính
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                const active = isActive(item.path)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => router.push(item.path)}
                      className={cn(
                        "group relative w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        active &&
                          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800",
                      )}
                    >
                      <div className={cn("flex items-center space-x-3 flex-1", active && "font-medium")}>
                        <div
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            active
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300",
                          )}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            active
                              ? "text-blue-700 dark:text-blue-300 font-medium"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                      {active && <ChevronRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full"></div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>      <SidebarFooter className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-slate-600 dark:border-slate-400 rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
