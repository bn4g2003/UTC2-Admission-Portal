"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../../../hooks/use-auth"
import { TeacherLayout } from "@/components/teacher-layout"
import { Loader2, Calendar, Users, BookOpen, ArrowRight } from "lucide-react"

type EnrollmentPlan = {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  stages_count: number
  status: "upcoming" | "ongoing" | "completed"
}

export default function TeacherEnrollmentPlans() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<EnrollmentPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user?.role === "GIAOVIEN") {
      fetchEnrollmentPlans()
    }
  }, [user])
  const fetchEnrollmentPlans = async () => {
    try {
      setIsLoadingPlans(true)
      const response = await fetch("/api/teacher/enrollment-plans", {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlans(data as EnrollmentPlan[])
      } else {
        console.error("Failed to fetch enrollment plans")
      }
    } catch (error) {
      console.error("Error fetching enrollment plans:", error)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ongoing":
        return "bg-green-50 text-green-700 border-green-200"
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return "🔵"
      case "ongoing":
        return "🟢"
      case "completed":
        return "⚪"
      default:
        return "⚪"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
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
            <h1 className="text-3xl font-bold tracking-tight">Kế hoạch Tuyển sinh</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi các kế hoạch tuyển sinh được phân công</p>
          </div>
          <Button onClick={() => fetchEnrollmentPlans()}>Làm mới</Button>
        </div>

        {isLoadingPlans ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Không có kế hoạch tuyển sinh nào</p>
              <p className="text-gray-500">Chưa có kế hoạch tuyển sinh nào được phân công cho bạn</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{plan.name}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(plan.status)} font-medium ml-2 flex-shrink-0`}>
                      <span className="mr-1">{getStatusIcon(plan.status)}</span>
                      {plan.status === "upcoming"
                        ? "Sắp diễn ra"
                        : plan.status === "ongoing"
                          ? "Đang diễn ra"
                          : "Đã kết thúc"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Số giai đoạn:</span>
                      </div>
                      <span className="font-semibold text-gray-900">{plan.stages_count}</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => router.push(`/teacherdashboard/enrollment-plans/${plan.id}`)}
                    >
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {plans.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-1 rounded">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-blue-900">Tổng quan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {plans.filter((p) => p.status === "upcoming").length}
                </div>
                <div className="text-blue-700">Sắp diễn ra</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {plans.filter((p) => p.status === "ongoing").length}
                </div>
                <div className="text-green-700">Đang diễn ra</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-600">
                  {plans.filter((p) => p.status === "completed").length}
                </div>
                <div className="text-gray-700">Đã hoàn thành</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
