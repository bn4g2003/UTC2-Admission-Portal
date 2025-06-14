"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Calendar,
  AlarmClock,
  ListOrdered,
} from "lucide-react"

interface EnrollmentStage {
  id: string
  plan_id: string
  stage_name: string
  stage_description: string
  start_time: string
  end_time: string
  stage_order: number
  created_at: string
  updated_at: string
  created_by: {
    id: string
    name: string
    email: string
  }
}

interface EnrollmentPlan {
  id: string
  updated_at: string
  created_at: string
  end_date: string
  start_date: string
  description: string
  name: string
    created_by: {
    id: string
    name: string
    email: string
  }
  status: "upcoming" | "ongoing" | "completed"
}

export default function StagesManagement() {
  const router = useRouter()
  const params = useParams()
  const [planId, setPlanId] = useState<string | null>(null)
  
  useEffect(() => {
    if (params?.planId) {
      setPlanId(params.planId as string)
    }
  }, [params])

  const [plan, setPlan] = useState<EnrollmentPlan | null>(null)
  const [stages, setStages] = useState<EnrollmentStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddStageOpen, setIsAddStageOpen] = useState(false)
  const [isEditStageOpen, setIsEditStageOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<EnrollmentStage | null>(null)
  const [newStage, setNewStage] = useState({
    stage_name: "",
    stage_description: "",
    start_time: "",
    end_time: "",
    stage_order: 1,
  })
  useEffect(() => {
    if (!planId) {
      return; // Early return if planId is not available
    }
    fetchPlanAndStages()
  }, [planId])

  const fetchPlanAndStages = async () => {
    if (!planId) {
      setError("Không tìm thấy ID kế hoạch")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      const planResponse = await fetch(`/api/enrollment-plans/${planId}`, {
        credentials: "include",
      })

      if (!planResponse.ok) {
        throw new Error("Failed to fetch plan details")
      }

      const planData = await planResponse.json()
      setPlan(planData)

      const stagesResponse = await fetch(`/api/enrollment_stages?planId=${planId}`, {
        credentials: "include",
      })

      if (!stagesResponse.ok) {
        throw new Error("Failed to fetch stages")
      }

      const stagesData = await stagesResponse.json()
      setStages(stagesData)

      // Update new stage order to be the next in sequence
      setNewStage((prev) => ({
        ...prev,
        stage_order: stagesData.length + 1,
      }))
    } catch (err) {
      setError("Không thể tải thông tin giai đoạn")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) return

    // Validate dates
    const startTime = new Date(newStage.start_time)
    const endTime = new Date(newStage.end_time)

    if (endTime <= startTime) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu")
      return
    }

    try {
      const response = await fetch("/api/enrollment_stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...newStage, planId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add stage")
      }

      await fetchPlanAndStages()
      setIsAddStageOpen(false)
      setNewStage({
        stage_name: "",
        stage_description: "",
        start_time: "",
        end_time: "",
        stage_order: stages.length + 1,
      })
      setError("")
    } catch (err: any) {
      setError(err.message || "Không thể thêm giai đoạn mới")
      console.error("Error adding stage:", err)
    }
  }

  const handleEditStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStage) return

    // Validate dates
    const startTime = new Date(selectedStage.start_time)
    const endTime = new Date(selectedStage.end_time)

    if (endTime <= startTime) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu")
      return
    }

    try {
      const response = await fetch(`/api/enrollment_stages/${selectedStage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(selectedStage),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update stage")
      }

      setIsEditStageOpen(false)
      setSelectedStage(null)
      await fetchPlanAndStages()
      setError("")
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật giai đoạn")
      console.error("Error updating stage:", err)
    }
  }

  const handleDeleteStage = async () => {
    if (!selectedStage) return

    try {
      const response = await fetch(`/api/enrollment_stages/${selectedStage.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete stage")
      }

      setIsDeleteDialogOpen(false)
      setSelectedStage(null)
      await fetchPlanAndStages()
      setError("")
    } catch (err: any) {
      setError(err.message || "Không thể xóa giai đoạn")
      console.error("Error deleting stage:", err)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: EnrollmentPlan["status"]) => {
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
  if (!planId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Không tìm thấy thông tin kế hoạch</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* <AppSidebar /> */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/enrollment-plans")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Kế hoạch Tuyển sinh</span>
            </Button>
            <div className="flex-1" />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Plan Info Card */}
                <Card className="mb-8 bg-gradient-to-r from-cyan-50 to-green-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold">Quản lý Giai đoạn</h1>
                        <CardTitle className="text-xl mt-2">{plan?.name}</CardTitle>
                      </div>
                      {plan && getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Ngày bắt đầu:</p>
                          <p className="font-medium">{plan ? formatDateTime(plan.start_date) : "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Ngày kết thúc:</p>
                          <p className="font-medium">{plan ? formatDateTime(plan.end_date) : "-"}</p>
                        </div>
                      </div>
                      {plan?.description && (
                        <div className="col-span-full flex items-start gap-2 mt-2">
                          <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-muted-foreground">Mô tả:</p>
                            <p className="font-medium">{plan.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-gradient-to-r from-cyan-50 to-green-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng số giai đoạn</CardTitle>
                      <ListOrdered className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stages.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-cyan-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Giai đoạn sắp tới</CardTitle>
                      <AlarmClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stages.filter((stage) => new Date(stage.start_time) > new Date()).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-cyan-50 to-green-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Giai đoạn đã hoàn thành</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stages.filter((stage) => new Date(stage.end_time) < new Date()).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Add Stage Button */}
                <div className="flex justify-end mb-6">
                  <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm Giai đoạn
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Thêm Giai đoạn Mới</DialogTitle>
                        <DialogDescription>
                          Điền thông tin để tạo giai đoạn mới cho kế hoạch tuyển sinh.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStage}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="stage_name">Tên giai đoạn</Label>
                            <Input
                              id="stage_name"
                              value={newStage.stage_name}
                              onChange={(e) => setNewStage({ ...newStage, stage_name: e.target.value })}
                              required
                              placeholder="Nhập tên giai đoạn"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stage_description">Mô tả</Label>
                            <Textarea
                              id="stage_description"
                              value={newStage.stage_description}
                              onChange={(e) => setNewStage({ ...newStage, stage_description: e.target.value })}
                              placeholder="Mô tả chi tiết về giai đoạn"
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="start_time">Thời gian bắt đầu</Label>
                            <Input
                              id="start_time"
                              type="datetime-local"
                              value={newStage.start_time}
                              onChange={(e) => setNewStage({ ...newStage, start_time: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end_time">Thời gian kết thúc</Label>
                            <Input
                              id="end_time"
                              type="datetime-local"
                              value={newStage.end_time}
                              onChange={(e) => setNewStage({ ...newStage, end_time: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stage_order">Thứ tự</Label>
                            <Input
                              id="stage_order"
                              type="number"
                              value={newStage.stage_order}
                              onChange={(e) =>
                                setNewStage({ ...newStage, stage_order: Number.parseInt(e.target.value) })
                              }
                              required
                              min="1"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Thêm giai đoạn</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Stages Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách giai đoạn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>                        <TableRow>
                          <TableHead>Thứ tự</TableHead>
                          <TableHead>Tên giai đoạn</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Thời gian bắt đầu</TableHead>
                          <TableHead>Thời gian kết thúc</TableHead>
                          <TableHead>Người tạo</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stages.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Chưa có giai đoạn nào. Hãy thêm giai đoạn mới.
                            </TableCell>
                          </TableRow>
                        ) : (
                          stages.map((stage) => (
                            <TableRow key={stage.id}>
                              <TableCell className="font-medium">{stage.stage_order}</TableCell>
                              <TableCell>{stage.stage_name}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{stage.stage_description}</TableCell>                              <TableCell>{formatDateTime(stage.start_time)}</TableCell>
                              <TableCell>{formatDateTime(stage.end_time)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{stage.created_by?.name || "N/A"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mr-2"
                                  onClick={() => {
                                    setSelectedStage(stage)
                                    setIsEditStageOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStage(stage)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Edit Stage Dialog */}
                <Dialog open={isEditStageOpen} onOpenChange={setIsEditStageOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa Giai đoạn</DialogTitle>
                      <DialogDescription>Cập nhật thông tin giai đoạn trong kế hoạch tuyển sinh.</DialogDescription>
                    </DialogHeader>
                    {selectedStage && (
                      <form onSubmit={handleEditStage}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit_stage_name">Tên giai đoạn</Label>
                            <Input
                              id="edit_stage_name"
                              value={selectedStage.stage_name}
                              onChange={(e) => setSelectedStage({ ...selectedStage, stage_name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit_stage_description">Mô tả</Label>
                            <Textarea
                              id="edit_stage_description"
                              value={selectedStage.stage_description}
                              onChange={(e) =>
                                setSelectedStage({ ...selectedStage, stage_description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit_start_time">Thời gian bắt đầu</Label>
                            <Input
                              id="edit_start_time"
                              type="datetime-local"
                              value={selectedStage.start_time.split(".")[0]} // Remove milliseconds
                              onChange={(e) => setSelectedStage({ ...selectedStage, start_time: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit_end_time">Thời gian kết thúc</Label>
                            <Input
                              id="edit_end_time"
                              type="datetime-local"
                              value={selectedStage.end_time.split(".")[0]} // Remove milliseconds
                              onChange={(e) => setSelectedStage({ ...selectedStage, end_time: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit_stage_order">Thứ tự</Label>
                            <Input
                              id="edit_stage_order"
                              type="number"
                              value={selectedStage.stage_order}
                              onChange={(e) =>
                                setSelectedStage({
                                  ...selectedStage,
                                  stage_order: Number.parseInt(e.target.value),
                                })
                              }
                              required
                              min="1"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Lưu thay đổi</Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận xóa giai đoạn</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                      Bạn có chắc chắn muốn xóa giai đoạn <strong>{selectedStage?.stage_name}</strong> không? Hành động
                      này không thể hoàn tác.
                    </p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button variant="outline" onClick={handleDeleteStage}>
                        Xóa giai đoạn
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
