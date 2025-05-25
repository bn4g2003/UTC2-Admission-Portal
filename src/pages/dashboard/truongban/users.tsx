"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Edit, Trash2, Plus, Search } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  full_name: string | null
  phone_number: string | null
  address: string | null
  date_of_birth: string | null
  created_at: string
}

export default function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    full_name: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.message || "Không thể tải danh sách người dùng")
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err)
      setError("Lỗi kết nối khi tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const endpoint = currentUser
        ? `/api/user-management?id=${currentUser.id}`
        : "/api/user-management"
      const method = currentUser ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setShowDialog(false)
        fetchUsers()
      } else {
        setFormError(data.message || "Có lỗi xảy ra")
      }
    } catch (err) {
      console.error("Lỗi khi gửi form:", err)
      setFormError("Lỗi kết nối")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return
    }

    try {
      const response = await fetch(`/api/user-management?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        fetchUsers()
      } else {
        setError(data.message || "Không thể xóa người dùng")
      }
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err)
      setError("Lỗi kết nối khi xóa người dùng")
    }
  }

  const openAddDialog = () => {
    setCurrentUser(null)
    setFormData({
      email: "",
      password: "",
      role: "",
      full_name: "",
      phone_number: "",
      address: "",
      date_of_birth: "",
    })
    setFormError(null)
    setShowDialog(true)
  }

  const openEditDialog = (user: User) => {
    setCurrentUser(user)
    setFormData({
      email: user.email,
      password: "", // Để trống khi sửa
      role: user.role,
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      address: user.address || "",
      date_of_birth: user.date_of_birth || "",
    })
    setFormError(null)
    setShowDialog(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
                <p className="text-sm text-gray-500">Quản lý tài khoản người dùng trong hệ thống</p>
              </div>
            </div>
            <Button onClick={openAddDialog} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm Người dùng</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo email hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="TRUONGBAN">Trưởng ban</SelectItem>
                  <SelectItem value="GIAOVIEN">Giáo viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Không tìm thấy người dùng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.full_name || "—"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "TRUONGBAN"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role === "TRUONGBAN" ? "Trưởng ban" : "Giáo viên"}
                          </span>
                        </TableCell>
                        <TableCell>{user.phone_number || "—"}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              onClick={() => openEditDialog(user)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Sửa</span>
                            </Button>
                            <Button
                              onClick={() => handleDelete(user.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Xóa</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentUser ? "Chỉnh sửa Người dùng" : "Thêm Người dùng Mới"}</DialogTitle>
            <DialogDescription>
              {currentUser
                ? "Cập nhật thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi."
                : "Nhập thông tin để tạo tài khoản người dùng mới."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Mật khẩu {currentUser && "(để trống nếu không thay đổi)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!currentUser}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRUONGBAN">Trưởng ban</SelectItem>
                    <SelectItem value="GIAOVIEN">Giáo viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="full_name">Họ tên</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone_number">Số điện thoại</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">Ngày sinh</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            {formError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{formError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : currentUser ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 