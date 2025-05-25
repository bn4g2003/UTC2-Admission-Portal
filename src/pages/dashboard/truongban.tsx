"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, LogOut, Users, Shield } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export default function TruongBanDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Form states
  const [formEmail, setFormEmail] = useState<string>("")
  const [formPassword, setFormPassword] = useState<string>("")
  const [formRole, setFormRole] = useState<string>("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.message || "Không thể tải danh sách người dùng.")
      }
    } catch (err) {
      console.error("Lỗi khi fetch users:", err)
      setError("Lỗi kết nối khi tải danh sách người dùng.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;"
    router.push("/auth/login")
  }

  const openAddDialog = () => {
    setFormEmail("")
    setFormPassword("")
    setFormRole("")
    setFormError(null)
    setFormSuccess(null)
    setCurrentUser(null)
    setIsEditing(false)
    setShowDialog(true)
  }

  const openEditDialog = (user: User) => {
    setFormEmail(user.email)
    setFormPassword("")
    setFormRole(user.role)
    setFormError(null)
    setFormSuccess(null)
    setCurrentUser(user)
    setIsEditing(true)
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setCurrentUser(null)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)

    const apiEndpoint = currentUser ? `/api/user-management?id=${currentUser.id}` : `/api/user-management`
    const method = currentUser ? "PUT" : "POST"
    const bodyData: any = { email: formEmail, role: formRole }

    if (formPassword) {
      bodyData.password = formPassword
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      })

      const data = await response.json()
      if (response.ok) {
        setFormSuccess(data.message)
        fetchUsers()
        closeDialog()
      } else {
        setFormError(data.message || "Có lỗi xảy ra.")
      }
    } catch (err) {
      console.error("Lỗi khi gửi form:", err)
      setFormError("Lỗi kết nối.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return
    }
    try {
      const response = await fetch(`/api/user-management?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (response.ok) {
        setFormSuccess(data.message)
        fetchUsers()
      } else {
        setFormError(data.message || "Không thể xóa người dùng.")
      }
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err)
      setFormError("Lỗi kết nối khi xóa người dùng.")
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      TRUONGBAN: { label: "Trưởng ban", variant: "default" as const },
      nhanvien: { label: "Nhân viên", variant: "secondary" as const },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Trưởng ban</h1>
                <p className="text-sm text-gray-500">Quản lý tài khoản người dùng</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(error || formError) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error || formError}</AlertDescription>
          </Alert>
        )}

        {formSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{formSuccess}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <CardTitle>Danh sách người dùng</CardTitle>
              </div>
              <Button onClick={openAddDialog} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Thêm người dùng</span>
              </Button>
            </div>
            <CardDescription>Quản lý tài khoản và phân quyền người dùng trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Không có người dùng nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm">{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
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
                                onClick={() => handleDeleteUser(user.id)}
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
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Cập nhật thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi."
                : "Nhập thông tin để tạo tài khoản người dùng mới."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu {isEditing && "(để trống nếu không thay đổi)"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required={!isEditing}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={formRole} onValueChange={setFormRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRUONGBAN">Trưởng ban</SelectItem>
                    <SelectItem value="nhanvien">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
