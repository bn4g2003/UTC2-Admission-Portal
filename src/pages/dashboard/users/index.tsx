"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  User,
} from "lucide-react"

interface UserType {
  id: string
  email: string
  full_name: string
  role: "TRUONGBAN" | "GIAOVIEN"
  phone_number: string
  address: string
  date_of_birth: string
  created_at: string
  updated_at: string
}

interface UpdateUserData {
  email?: string
  full_name?: string
  role?: "TRUONGBAN" | "GIAOVIEN"
  phone_number?: string
  address?: string
  date_of_birth?: string
}

const menuItems = [
  { title: "Tổng quan", path: "/dashboard", icon: Home },
  { title: "Quản lý Người dùng", path: "/dashboard/users", icon: Users },
  { title: "Kế hoạch Tuyển sinh", path: "/dashboard/enrollment-plans", icon: GraduationCap },
  { title: "Phân công Nhiệm vụ", path: "/dashboard/assignments", icon: ClipboardList },
  { title: "Thông báo", path: "/dashboard/notifications", icon: Bell },
  { title: "Báo cáo", path: "/dashboard/reports", icon: FileText },
  { title: "Tài liệu", path: "/dashboard/documents", icon: FolderOpen },
  { title: "Chat Nội bộ", path: "/dashboard/chat", icon: MessageCircle },
]

function AppSidebar() {
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
                      {/* {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )} */}
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

export default function UsersManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "GIAOVIEN" as "TRUONGBAN" | "GIAOVIEN",
    phone_number: "",
    address: "",
    date_of_birth: "",
  })

  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError("Không thể tải danh sách người dùng")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newUser.email || !newUser.password || !newUser.full_name) {
      setError("Email, mật khẩu và họ tên là bắt buộc")
      return
    }

    if (!newUser.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email không hợp lệ")
      return
    }

    if (newUser.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newUser),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Email đã tồn tại trong hệ thống")
        } else if (response.status === 400) {
          throw new Error(data.message || "Dữ liệu không hợp lệ")
        } else {
          throw new Error(data.message || "Không thể thêm người dùng mới")
        }
      }

      await fetchUsers()
      setIsAddUserOpen(false)

      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "GIAOVIEN",
        phone_number: "",
        address: "",
        date_of_birth: "",
      })
    } catch (err: any) {
      setError(err.message || "Không thể thêm người dùng mới")
      console.error("Error adding user:", err)
    }
  }

  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to update user")
      }

      setUsers(users.map((user) => (user.id === selectedUser.id ? result.user : user)))
      setSelectedUser(result.user)
      setIsEditMode(false)
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật thông tin người dùng")
      console.error("Error updating user:", err)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setSelectedUser(null)
      setIsDeleteDialogOpen(false)
      setIsUserDetailOpen(false)
    } catch (err) {
      setError("Không thể xóa người dùng")
      console.error("Error deleting user:", err)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Button
              variant="outline"
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
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Quản lý Người dùng</h1>
                <p className="text-muted-foreground">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm Người dùng
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Thêm Người dùng Mới</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                      <Input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Họ và tên</label>
                      <Input
                        required
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vai trò</label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "TRUONGBAN" | "GIAOVIEN") => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GIAOVIEN">Giáo viên</SelectItem>
                          <SelectItem value="TRUONGBAN">Trưởng ban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                      <Input
                        type="tel"
                        value={newUser.phone_number}
                        onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                      <Input
                        value={newUser.address}
                        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                      <Input
                        type="date"
                        value={newUser.date_of_birth}
                        onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Thêm người dùng
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm theo email, tên hoặc số điện thoại..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trưởng ban</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter((u) => u.role === "TRUONGBAN").length}</div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "TRUONGBAN" ? "default" : "secondary"}>
                              {user.role === "TRUONGBAN" ? "Trưởng ban" : "Giáo viên"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsUserDetailOpen(true)
                              }}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>

      {/* User Detail Sheet */}
      <Sheet open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Thông tin chi tiết người dùng</SheetTitle>
          </SheetHeader>

          {selectedUser && (
            <div className="mt-6">
              {isEditMode ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    handleUpdateUser({
                      email: formData.get("email") as string,
                      full_name: formData.get("full_name") as string,
                      role: formData.get("role") as "TRUONGBAN" | "GIAOVIEN",
                      phone_number: formData.get("phone_number") as string,
                      address: formData.get("address") as string,
                      date_of_birth: formData.get("date_of_birth") as string,
                    })
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input name="email" defaultValue={selectedUser.email} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên</label>
                    <Input name="full_name" defaultValue={selectedUser.full_name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vai trò</label>
                    <Select name="role" defaultValue={selectedUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GIAOVIEN">Giáo viên</SelectItem>
                        <SelectItem value="TRUONGBAN">Trưởng ban</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <Input name="phone_number" defaultValue={selectedUser.phone_number} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                    <Input name="address" defaultValue={selectedUser.address} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                    <Input name="date_of_birth" type="date" defaultValue={selectedUser.date_of_birth} />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Lưu thay đổi
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Họ và tên</label>
                      <p className="font-medium">{selectedUser.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Vai trò</label>
                      <Badge variant={selectedUser.role === "TRUONGBAN" ? "default" : "secondary"}>
                        {selectedUser.role === "TRUONGBAN" ? "Trưởng ban" : "Giáo viên"}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Số điện thoại</label>
                      <p className="font-medium">{selectedUser.phone_number}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Địa chỉ</label>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Ngày sinh</label>
                      <p className="font-medium">{formatDate(selectedUser.date_of_birth)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Ngày tạo</label>
                      <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cập nhật lần cuối</label>
                      <p className="font-medium">{formatDate(selectedUser.updated_at)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={() => setIsEditMode(true)} className="flex-1 flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.full_name}</strong> không? Hành động này không
            thể hoàn tác.
          </p>
          <div className="flex space-x-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="secondary" onClick={handleDeleteUser}>
              Xóa người dùng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
