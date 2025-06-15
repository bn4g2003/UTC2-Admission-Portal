"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "../../../hooks/use-toast"
import { useAuth } from "../../../hooks/use-auth"
import { CalendarIcon, Mail, Phone, User, MapPin, Edit, Save, X, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { TeacherLayout } from "@/components/teacher-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type UserProfile = {
  id: string
  email: string
  role: string
  full_name: string
  phone_number: string
  address: string
  date_of_birth?: string
}

export default function TeacherProfile() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user?.role === "GIAOVIEN") {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true)
      const response = await axios.get("/api/teacher/profile")
      setProfile(response.data as UserProfile)
      setEditedProfile(response.data as UserProfile)
      setLoadingProfile(false)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cá nhân",
        variant: "destructive",
      })
      setLoadingProfile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Only send the fields that have been edited
      const changedFields: Partial<UserProfile> = {}
      for (const key in editedProfile) {
        if (profile && profile[key as keyof UserProfile] !== editedProfile[key as keyof UserProfile]) {
          changedFields[key as keyof UserProfile] = editedProfile[key as keyof UserProfile]
        }
      }

      await axios.put("/api/teacher/profile", changedFields)

      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      })

      // Refresh the profile
      fetchUserProfile()
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin cá nhân",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới và xác nhận không khớp",
        variant: "destructive",
      })
      return
    }
    try {
      setIsChangingPassword(true)
      interface PasswordChangeResponse {
        message?: string
        [key: string]: any
      }
      const res = await axios.put<PasswordChangeResponse>("/api/teacher/profile/password", {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      })
      toast({
        title: "Thành công",
        description: res.data?.message || "Đổi mật khẩu thành công!",
      })
      setShowPasswordDialog(false)
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
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

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
            <p className="text-gray-500 mt-1">Xem và chỉnh sửa thông tin hồ sơ của bạn</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              Đổi mật khẩu
            </Button>
            <Button onClick={() => fetchUserProfile()}>Làm mới</Button>
          </div>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Hồ sơ cá nhân</CardTitle>
                    <CardDescription>Quản lý thông tin cá nhân và cài đặt tài khoản</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left: Avatar & summary */}
                  <div className="col-span-1 flex flex-col items-center gap-4 border-r md:pr-6">
                    <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <User className="h-14 w-14 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900">{profile?.full_name || "N/A"}</h3>
                      <p className="text-gray-600 text-base">
                        {profile?.role === "GIAOVIEN" ? "Giáo viên" : profile?.role}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tài khoản đã xác thực
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Right: Details */}
                  <div className="col-span-2">
                    {!isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-600">Email</span>
                                <p className="text-gray-900 font-medium">{profile?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                              <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-600">Số điện thoại</span>
                                <p className="text-gray-900 font-medium">
                                  {profile?.phone_number || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-600">Địa chỉ</span>
                                <p className="text-gray-900 font-medium">
                                  {profile?.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                </p>
                              </div>
                            </div>
                            {profile?.date_of_birth && (
                              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-600">Ngày sinh</span>
                                  <p className="text-gray-900 font-medium">
                                    {new Date(profile.date_of_birth).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="full_name" className="text-sm font-medium">
                                Họ và tên *
                              </Label>
                              <Input
                                id="full_name"
                                name="full_name"
                                value={editedProfile.full_name || ""}
                                onChange={handleInputChange}
                                required
                                className="h-11"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email" className="text-sm font-medium">
                                Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                value={editedProfile.email || ""}
                                onChange={handleInputChange}
                                required
                                readOnly
                                className="h-11 bg-gray-50"
                              />
                              <p className="text-xs text-gray-500">Email không thể thay đổi</p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="phone_number" className="text-sm font-medium">
                                Số điện thoại
                              </Label>
                              <Input
                                id="phone_number"
                                name="phone_number"
                                value={editedProfile.phone_number || ""}
                                onChange={handleInputChange}
                                className="h-11"
                                placeholder="Nhập số điện thoại"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="address" className="text-sm font-medium">
                                Địa chỉ
                              </Label>
                              <Input
                                id="address"
                                name="address"
                                value={editedProfile.address || ""}
                                onChange={handleInputChange}
                                className="h-11"
                                placeholder="Nhập địa chỉ"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="date_of_birth" className="text-sm font-medium">
                                Ngày sinh
                              </Label>
                              <Input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={
                                  editedProfile.date_of_birth
                                    ? new Date(editedProfile.date_of_birth).toISOString().split("T")[0]
                                    : ""
                                }
                                onChange={handleInputChange}
                                className="h-11"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 border-t px-6 py-4">
                <div className="flex justify-end gap-3 w-full">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Hủy
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Đổi mật khẩu Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Đổi mật khẩu</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordFields.currentPassword}
                  onChange={handlePasswordFieldChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordFields.newPassword}
                  onChange={handlePasswordFieldChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordFields.confirmPassword}
                  onChange={handlePasswordFieldChange}
                  required
                />
              </div>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setShowPasswordDialog(false)} disabled={isChangingPassword}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đổi mật khẩu"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherLayout>
  )
}
