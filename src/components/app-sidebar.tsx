import { useRouter } from "next/navigation"
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
  MessageCircle,
  BarChart3,
  Settings,
  Home,
  LogOut,
  User,
} from "lucide-react"

const menuItems = [
  { title: "Tổng quan", path: "/dashboard", icon: Home },
  { title: "Quản lý Người dùng", path: "/dashboard/users", icon: Users },
  { title: "Kế hoạch Tuyển sinh", path: "/dashboard/enrollment-plans", icon: GraduationCap },
  { title: "Phân công Nhiệm vụ", path: "/dashboard/assignments", icon: ClipboardList},
  { title: "Thông báo", path: "/dashboard/notifications", icon: Bell },
  { title: "Báo cáo", path: "/dashboard/reports", icon: FileText },
  { title: "Tài liệu", path: "/dashboard/documents", icon: FolderOpen },
  { title: "Chat Nội bộ", path: "/dashboard/chat", icon: MessageCircle },
]

export default function AppSidebar() {
  const router = useRouter()

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
                <SidebarMenuButton>
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
            <SidebarMenuButton>
              <User className="w-4 h-4" />
              <span>Hồ sơ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
