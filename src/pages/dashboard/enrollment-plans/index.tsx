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
import { Textarea } from "@/components/ui/textarea"
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
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
} from "lucide-react"

interface EnrollmentPlan {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  created_by_name: string
  created_by_email: string
  created_at: string
  updated_at: string
  status: "upcoming" | "ongoing" | "completed"
  stages_count: number
}

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

export default function EnrollmentPlansManagement() {
  const [plans, setPlans] = useState<EnrollmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false)
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<EnrollmentPlan | null>(null)
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  })

  const router = useRouter()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/enrollment-plans", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch plans")
      }

      const data = await response.json()
      setPlans(data)
    } catch (err) {
      setError("Không thể tải danh sách kế hoạch")
      console.error("Error fetching plans:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate dates
    const startDate = new Date(newPlan.start_date)
    const endDate = new Date(newPlan.end_date)

    if (endDate <= startDate) {
      setError("Ngày kết thúc phải sau ngày bắt đầu")
      return
    }

    try {
      const response = await fetch("/api/enrollment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newPlan),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add plan")
      }

      await fetchPlans()
      setIsAddPlanOpen(false)
      setNewPlan({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      })
    } catch (err: any) {
      setError(err.message || "Không thể thêm kế hoạch mới")
      console.error("Error adding plan:", err)
    }
  }

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    try {
      const startDate = new Date(selectedPlan.start_date)
      const endDate = new Date(selectedPlan.end_date)

      if (endDate <= startDate) {
        setError("Ngày kết thúc phải sau ngày bắt đầu")
        return
      }

      const response = await fetch(`/api/enrollment-plans/${selectedPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: selectedPlan.name,
          description: selectedPlan.description,
          start_date: selectedPlan.start_date.split("T")[0],
          end_date: selectedPlan.end_date.split("T")[0],
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to update plan")
      }

      await fetchPlans()
      setIsEditPlanOpen(false)
      setSelectedPlan(null)
      setError("")
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật kế hoạch")
      console.error("Error updating plan:", err)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    try {
      const response = await fetch(`/api/enrollment-plans/${selectedPlan.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete plan")
      }

      setPlans(plans.filter((plan) => plan.id !== selectedPlan.id))
      setSelectedPlan(null)
      setIsDeleteDialogOpen(false)
      setIsPlanDetailOpen(false)
    } catch (err: any) {
      setError(err.message || "Không thể xóa kế hoạch")
      console.error("Error deleting plan:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Sắp diễn ra
          </Badge>
        )
      case "ongoing":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <PlayCircle className="w-3 h-3" />
            Đang diễn ra
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã kết thúc
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const getStatusStats = () => {
    return {
      upcoming: plans.filter((p) => p.status === "upcoming").length,
      ongoing: plans.filter((p) => p.status === "ongoing").length,
      completed: plans.filter((p) => p.status === "completed").length,
    }
  }

  const stats = getStatusStats()

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
                <h1 className="text-3xl font-bold text-foreground">Quản lý Kế hoạch Tuyển sinh</h1>
                <p className="text-muted-foreground">Quản lý và theo dõi các kế hoạch tuyển sinh của trường</p>
              </div>
              <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm Kế hoạch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Thêm Kế hoạch Tuyển sinh Mới</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPlan} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên kế hoạch</label>
                      <Input
                        required
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                        placeholder="Nhập tên kế hoạch"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mô tả</label>
                      <Textarea
                        rows={3}
                        required
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                        placeholder="Mô tả chi tiết về kế hoạch"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                      <Input
                        type="date"
                        required
                        value={newPlan.start_date}
                        onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                      <Input
                        type="date"
                        required
                        value={newPlan.end_date}
                        onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Thêm kế hoạch
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng kế hoạch</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sắp diễn ra</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcoming}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đang diễn ra</CardTitle>
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.ongoing}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Plans Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách kế hoạch tuyển sinh</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên kế hoạch</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số giai đoạn</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Ngày kết thúc</TableHead>
                      <TableHead>Người tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : plans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Chưa có kế hoạch tuyển sinh nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{plan.stages_count} giai đoạn</Badge>
                          </TableCell>                          <TableCell>{formatDate(plan.start_date)}</TableCell>
                          <TableCell>{formatDate(plan.end_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{plan.created_by_name || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/enrollment-plans/${plan.id}/stages/stages-management`)}
                              >
                                Giai đoạn
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPlan(plan)
                                  setIsPlanDetailOpen(true)
                                }}
                              >
                                Chi tiết
                              </Button>
                            </div>
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

      {/* Plan Detail Sheet */}
      <Sheet open={isPlanDetailOpen} onOpenChange={setIsPlanDetailOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Chi tiết kế hoạch tuyển sinh</SheetTitle>
          </SheetHeader>

          {selectedPlan && (
            <div className="mt-6">
              {isEditPlanOpen ? (
                <form onSubmit={handleEditPlan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên kế hoạch</label>
                    <Input
                      value={selectedPlan.name}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <Textarea
                      rows={3}
                      value={selectedPlan.description}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                    <Input
                      type="date"
                      value={selectedPlan.start_date?.split("T")[0] || ""}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                    <Input
                      type="date"
                      value={selectedPlan.end_date?.split("T")[0] || ""}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditPlanOpen(false)
                        setError("")
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Tên kế hoạch</label>
                      <p className="font-medium text-lg">{selectedPlan.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Mô tả</label>
                      <p className="font-medium">{selectedPlan.description}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Trạng thái</label>
                      <div className="mt-1">{getStatusBadge(selectedPlan.status)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Ngày bắt đầu</label>
                        <p className="font-medium">{formatDate(selectedPlan.start_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Ngày kết thúc</label>
                        <p className="font-medium">{formatDate(selectedPlan.end_date)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Số giai đoạn</label>
                        <p className="font-medium">{selectedPlan.stages_count} giai đoạn</p>
                      </div>
                      <div>                        <label className="text-sm text-muted-foreground">Người tạo</label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedPlan.created_by_name || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Ngày tạo</label>
                      <p className="font-medium">{formatDate(selectedPlan.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cập nhật lần cuối</label>
                      <p className="font-medium">{formatDate(selectedPlan.updated_at)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => router.push(`/dashboard/enrollment-plans/${selectedPlan.id}/stages/stages-management`)}
                      className="flex-1 flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Quản lý giai đoạn
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditPlanOpen(true)}
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
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
            <DialogTitle>Xác nhận xóa kế hoạch</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn xóa kế hoạch <strong>{selectedPlan?.name}</strong> không? Tất cả các giai đoạn liên
            quan sẽ bị xóa. Hành động này không thể hoàn tác.
          </p>
          <div className="flex space-x-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="outline" onClick={handleDeletePlan}>
              Xóa kế hoạch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
