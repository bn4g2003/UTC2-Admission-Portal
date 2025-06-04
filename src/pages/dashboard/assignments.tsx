"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppSidebar from "@/components/app-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Trash2,
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  Calendar,
  Filter,
} from "lucide-react"

interface Assignment {
  id: string
  stage_id: string
  assigned_to: string
  assignment_details: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  assigned_at: string
  completed_at: string | null
  assigned_to_name: string
  stage_name: string
  plan_name: string
}

interface Teacher {
  id: string
  full_name: string
  email: string
}

interface Stage {
  id: string
  stage_name: string
  stage_description: string
  start_time: string
  end_time: string
  plan_name: string
  plan_id: string
}


export default function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [teacherFilter, setTeacherFilter] = useState<string>("all")
  const [newAssignment, setNewAssignment] = useState({
    stage_id: "",
    assigned_to: "",
    assignment_details: "",
  })

  const router = useRouter()
  // TODO: Replace this with actual authentication logic to get the user's role
  const [userRole, setUserRole] = useState<"TRUONGBAN" | "GIANGVIEN">("TRUONGBAN")

  useEffect(() => {
    fetchAssignments()
    if (userRole === "TRUONGBAN") {
      fetchTeachers()
      fetchStages()
    }
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch assignments")
      }

      const data = await response.json()
      setAssignments(data)
    } catch (err) {
      setError("Không thể tải danh sách công việc")
      console.error("Error fetching assignments:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users/teachers", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }

      const data = await response.json()
      setTeachers(data)
    } catch (err) {
      console.error("Error fetching teachers:", err)
      setError("Không thể tải danh sách giảng viên")
    }
  }

  const fetchStages = async () => {
    try {
      const response = await fetch("/api/stages", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stages")
      }

      const data = await response.json()
      setStages(data)
    } catch (err) {
      console.error("Error fetching stages:", err)
      setError("Không thể tải danh sách giai đoạn")
    }
  }

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newAssignment.stage_id || !newAssignment.assigned_to || !newAssignment.assignment_details) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newAssignment),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add assignment")
      }

      await fetchAssignments()
      setIsAddAssignmentOpen(false)
      setNewAssignment({
        stage_id: "",
        assigned_to: "",
        assignment_details: "",
      })
    } catch (err: any) {
      setError(err.message || "Không thể thêm công việc mới")
      console.error("Error adding assignment:", err)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update status")
      }

      await fetchAssignments()
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật trạng thái")
      console.error("Error updating status:", err)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete assignment")
      }

      await fetchAssignments()
    } catch (err: any) {
      setError(err.message || "Không thể xóa công việc")
      console.error("Error deleting assignment:", err)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Đang thực hiện
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return null
    }
  }

  const getAssignmentStats = () => {
    return {
      total: assignments.length,
      pending: assignments.filter((a) => a.status === "pending").length,
      in_progress: assignments.filter((a) => a.status === "in_progress").length,
      completed: assignments.filter((a) => a.status === "completed").length,
      cancelled: assignments.filter((a) => a.status === "cancelled").length,
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const statusMatch = statusFilter === "all" || assignment.status === statusFilter
    const teacherMatch = teacherFilter === "all" || assignment.assigned_to === teacherFilter
    return statusMatch && teacherMatch
  })

  const stats = getAssignmentStats()

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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Quản lý Phân công Nhiệm vụ</h1>
                    <p className="text-muted-foreground">Phân công và theo dõi tiến độ công việc của giảng viên</p>
                  </div>
                  {userRole === "TRUONGBAN" && (
                    <Dialog open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Phân công mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Phân công Nhiệm vụ Mới</DialogTitle>
                          <DialogDescription>
                            Phân công công việc cho giảng viên trong giai đoạn tuyển sinh cụ thể.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddAssignment}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="stage_id">Giai đoạn tuyển sinh</Label>
                              <Select
                                value={newAssignment.stage_id}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, stage_id: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giai đoạn" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Giai đoạn hiện có</SelectLabel>
                                    {stages.map((stage) => (
                                      <SelectItem key={stage.id} value={stage.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{stage.stage_name}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {stage.plan_name} ({new Date(stage.start_time).toLocaleDateString("vi-VN")}{" "}
                                            - {new Date(stage.end_time).toLocaleDateString("vi-VN")})
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="assigned_to">Giảng viên được phân công</Label>
                              <Select
                                value={newAssignment.assigned_to}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, assigned_to: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giảng viên" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Danh sách giảng viên</SelectLabel>
                                    {teachers.map((teacher) => (
                                      <SelectItem key={teacher.id} value={teacher.id}>
                                        <div className="flex items-center gap-2">
                                          <UserCheck className="w-4 h-4" />
                                          <div className="flex flex-col">
                                            <span className="font-medium">{teacher.full_name}</span>
                                            <span className="text-sm text-muted-foreground">{teacher.email}</span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="assignment_details">Mô tả chi tiết công việc</Label>
                              <Textarea
                                id="assignment_details"
                                value={newAssignment.assignment_details}
                                onChange={(e) =>
                                  setNewAssignment({
                                    ...newAssignment,
                                    assignment_details: e.target.value,
                                  })
                                }
                                rows={4}
                                placeholder="Mô tả chi tiết về nhiệm vụ cần thực hiện..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Phân công nhiệm vụ</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <Card className="bg-gradient-to-r from-gray-100 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng nhiệm vụ</CardTitle>
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-100 to-gray-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                      <Clock className="h-4 w-4 " />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-gray-100 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
                      <AlertCircle className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.in_progress}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-100 to-gray-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                      <CheckCircle className="h-4 w-4 " />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.completed}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-gray-100 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                      <XCircle className="h-4 w-4 " />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.cancelled}</div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Filters */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Bộ lọc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="status-filter">Lọc theo trạng thái</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="teacher-filter">Lọc theo giảng viên</Label>
                        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả giảng viên</SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách phân công ({filteredAssignments.length} nhiệm vụ)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Giai đoạn</TableHead>
                          <TableHead>Kế hoạch</TableHead>
                          <TableHead>Giảng viên</TableHead>
                          <TableHead>Chi tiết công việc</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thời gian phân công</TableHead>
                          <TableHead>Thời gian hoàn thành</TableHead>
                          {userRole === "TRUONGBAN" && <TableHead className="text-right">Thao tác</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={userRole === "TRUONGBAN" ? 8 : 7} className="text-center py-8">
                              {assignments.length === 0
                                ? "Chưa có nhiệm vụ nào được phân công"
                                : "Không có nhiệm vụ nào phù hợp với bộ lọc"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">{assignment.stage_name}</TableCell>
                              <TableCell>{assignment.plan_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                                  {assignment.assigned_to_name}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="truncate" title={assignment.assignment_details}>
                                  {assignment.assignment_details}
                                </div>
                              </TableCell>
                              <TableCell>
                                {userRole === "GIANGVIEN" ? (
                                  <Select
                                    value={assignment.status}
                                    onValueChange={(value) => handleStatusUpdate(assignment.id, value)}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                                      <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                                      <SelectItem value="completed">Hoàn thành</SelectItem>
                                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  getStatusBadge(assignment.status)
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDateTime(assignment.assigned_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {assignment.completed_at ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    {formatDateTime(assignment.completed_at)}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Chưa hoàn thành</span>
                                )}
                              </TableCell>
                              {userRole === "TRUONGBAN" && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
