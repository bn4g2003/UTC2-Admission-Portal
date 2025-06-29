"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Interface này không cần thiết nếu bạn không dùng thông tin user từ localStorage
// Vì chúng ta sẽ dựa vào vai trò từ API response và cookie
// interface UserData {
//   id: string
//   email: string
//   role: string
//   firstName?: string
//   lastName?: string
// }

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotDialog, setShowForgotDialog] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState("")
  const [loginImage, setLoginImage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Log lỗi từ server để dễ debug
        console.error("Login API response error:", data);
        setError(data.message || "Đăng nhập thất bại");
        return;
      }

      // *** SỬA ĐỔI TẠI ĐÂY ***
      // Token đã được đặt vào HttpOnly cookie bởi server, không cần lưu vào localStorage nữa.
      // localStorage.setItem("authToken", data.token); // XÓA DÒNG NÀY
      // localStorage.setItem("userRole", data.user.role); // XÓA DÒNG NÀY (sẽ đọc vai trò từ cookie hoặc từ API khi cần)

      // Chuyển hướng dựa trên vai trò
      if (data.user.role === "TRUONGBAN") {
        setLoginImage("/images/login2.png");
        router.push("/dashboard");
      } else if (data.user.role === "GIAOVIEN") {
        setLoginImage("/images/login1.png");
        router.push("/teacherdashboard");
      } else {
        setLoginImage(null);
        router.push("/");
      }
    } catch (err) {
      console.error("Lỗi mạng hoặc server:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMessage("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await res.json()
      if (res.ok) {
        setForgotMessage("Đã gửi email hướng dẫn đặt lại mật khẩu (nếu email tồn tại trong hệ thống). Vui lòng kiểm tra hộp thư.")
      } else {
        setForgotMessage(data.message || "Không thể gửi email. Vui lòng thử lại sau.")
      }
    } catch (err) {
      setForgotMessage("Lỗi kết nối máy chủ. Vui lòng thử lại sau.")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {loginImage ? (
            <div className="flex items-center justify-center mb-4">
              <img src={loginImage} alt="Login role" className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 bg-white" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-600">Đăng nhập vào Hệ thống Tuyển sinh</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center text-gray-600">Nhập thông tin đăng nhập của bạn</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@utc2.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  onClick={() => setShowForgotDialog(true)}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quên mật khẩu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="forgotEmail">Nhập email của bạn</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                placeholder="example@utc2.edu.vn"
              />
            </div>
            {forgotMessage && (
              <div className="text-sm text-center text-blue-700 bg-blue-50 rounded p-2">{forgotMessage}</div>
            )}
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={() => setShowForgotDialog(false)} disabled={forgotLoading}>
                Đóng
              </Button>
              <Button type="submit" disabled={forgotLoading}>
                {forgotLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : "Gửi email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}