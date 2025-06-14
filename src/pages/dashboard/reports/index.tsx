"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import AppSidebar from "@/components/app-sidebar"
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
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Paperclip,
  MessageSquare,
  Filter,
  Download,
} from "lucide-react"

interface Document {
  id: string
  document_name: string
  file_path: string
  file_type: string
  file_size_kb: number
  uploaded_at: string
  downloadUrl?: string
}

interface Report {
  id: string
  assignment_id: string
  reported_by: string
  reporter_name: string
  report_content: string
  has_documents: boolean
  submitted_at: string
  status: "submitted" | "reviewed" | "rejected"
  reviewed_by: string | null
  reviewed_at: string | null
  review_comments: string | null
  assignment_details: string
  documents?: Document[]
  document_count?: number
}


export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewStatus, setReviewStatus] = useState<"reviewed" | "rejected">("reviewed")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailError, setDetailError] = useState("")

  const router = useRouter()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/reports", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reports")
      }

      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError("Không thể tải danh sách báo cáo")
      console.error("Error fetching reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReportDetails = async (reportId: string) => {
    setIsLoadingDetails(true)
    setDetailError("")
    setSelectedReport(null)
    
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch report details")
      }

      const data = await response.json()
      setSelectedReport(data)
    } catch (err) {
      setDetailError("Không thể tải chi tiết báo cáo")
      console.error("Error fetching report details:", err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleDownloadDocument = (downloadUrl: string | undefined, fileName: string) => {
    if (!downloadUrl) {
      setError("Không thể tải xuống tài liệu. URL không hợp lệ.")
      return
    }

    try {
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading document:", err)
      setError("Không thể tải xuống tài liệu.")
    }
  }

  const handleReviewReport = async () => {
    if (!selectedReport) return

    try {
      const response = await fetch(`/api/reports/${selectedReport.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: reviewStatus,
          review_comments: reviewComment,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to review report")
      }

      await fetchReports()
      setIsReviewDialogOpen(false)
      setSelectedReport(null)
      setReviewComment("")
      setReviewStatus("reviewed")
    } catch (err: any) {
      setError(err.message || "Không thể duyệt báo cáo")
      console.error("Error reviewing report:", err)
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

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        )
      default:
        return null
    }
  }

  const getReportStats = () => {
    return {
      total: reports.length,
      submitted: reports.filter((r) => r.status === "submitted").length,
      reviewed: reports.filter((r) => r.status === "reviewed").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
      withDocuments: reports.filter((r) => r.has_documents).length,
    }
  }

  const filteredReports = reports.filter((report) => {
    return statusFilter === "all" || report.status === statusFilter
  })

  const stats = getReportStats()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
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
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Báo cáo</h1>
                  <p className="text-muted-foreground">
                    Duyệt và quản lý báo cáo công việc từ giảng viên trong hệ thống
                  </p>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                      <Clock className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.submitted}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                      <CheckCircle className="h-4 w-4 " />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.reviewed}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
                      <XCircle className="h-4 w-4 " />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ">{stats.rejected}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Có tài liệu</CardTitle>
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.withDocuments}</div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Filter */}
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
                        <select
                          id="status-filter"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="submitted">Chờ duyệt</option>
                          <option value="reviewed">Đã duyệt</option>
                          <option value="rejected">Từ chối</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách báo cáo ({filteredReports.length} báo cáo)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người gửi</TableHead>
                          <TableHead>Chi tiết nhiệm vụ</TableHead>
                          <TableHead>Nội dung báo cáo</TableHead>
                          <TableHead>Tài liệu</TableHead>
                          <TableHead>Thời gian gửi</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thời gian duyệt</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              {reports.length === 0 ? "Chưa có báo cáo nào" : "Không có báo cáo nào phù hợp với bộ lọc"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {report.reporter_name}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <div className="truncate" title={report.assignment_details}>
                                  {report.assignment_details}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[250px]">
                                <div className="truncate" title={report.report_content}>
                                  {report.report_content}
                                </div>
                              </TableCell>
                              <TableCell>
                                {report.has_documents ? (
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <Paperclip className="w-3 h-3" />
                                    {report.document_count || '?'} tài liệu
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Không</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDateTime(report.submitted_at)}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(report.status)}</TableCell>
                              <TableCell>
                                {report.reviewed_at ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    {formatDateTime(report.reviewed_at)}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Chưa duyệt</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      fetchReportDetails(report.id);
                                      setIsDetailDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {report.status === "submitted" && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {
                                        fetchReportDetails(report.id);
                                        setIsReviewDialogOpen(true)
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Duyệt
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Review Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Duyệt Báo cáo</DialogTitle>
                      <DialogDescription>Xem xét và đưa ra quyết định về báo cáo từ giảng viên.</DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                      <div className="py-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : detailError ? (
                      <div className="py-4">
                        <Alert variant="destructive">
                          <AlertDescription>{detailError}</AlertDescription>
                        </Alert>
                      </div>
                    ) : selectedReport && (
                      <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Nội dung báo cáo
                          </h3>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{selectedReport.report_content}</p>
                          </div>
                        </div>

                        {selectedReport.has_documents && selectedReport.documents && selectedReport.documents.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2 flex items-center gap-2">
                              <Paperclip className="w-4 h-4" />
                              Tài liệu đính kèm
                            </h3>
                            <div className="space-y-2 bg-muted p-2 rounded-lg">
                              {selectedReport.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm truncate max-w-[200px]">{doc.document_name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {formatFileSize(doc.file_size_kb)}
                                    </Badge>
                                  </div>
                                  {doc.downloadUrl && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleDownloadDocument(doc.downloadUrl, doc.document_name)}
                                      className="flex items-center gap-1 h-8"
                                    >
                                      <Download className="h-3 w-3" />
                                      Tải xuống
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="font-medium mb-3">Quyết định duyệt</h3>
                          <RadioGroup
                            value={reviewStatus}
                            onValueChange={(value) => setReviewStatus(value as "reviewed" | "rejected")}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="reviewed" id="reviewed" />
                              <Label htmlFor="reviewed" className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Duyệt báo cáo
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rejected" id="rejected" />
                              <Label htmlFor="rejected" className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                Từ chối báo cáo
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Nhận xét của bạn</h3>
                          <Textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Nhập nhận xét chi tiết về báo cáo..."
                            rows={4}
                          />
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button 
                        onClick={handleReviewReport}
                        disabled={isLoadingDetails || !selectedReport}
                      >
                        {reviewStatus === "reviewed" ? "Duyệt báo cáo" : "Từ chối báo cáo"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Chi tiết Báo cáo</DialogTitle>
                    </DialogHeader>
                    
                    {isLoadingDetails && (
                      <div className="py-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    )}
                    
                    {detailError && (
                      <div className="py-4">
                        <Alert variant="destructive">
                          <AlertDescription>{detailError}</AlertDescription>
                        </Alert>
                      </div>
                    )}
                    
                    {!isLoadingDetails && selectedReport && (
                      <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Người gửi</Label>
                            <p className="font-medium">{selectedReport.reporter_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                            <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-muted-foreground">Chi tiết nhiệm vụ</Label>
                          <p className="font-medium">{selectedReport.assignment_details}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-muted-foreground">Nội dung báo cáo</Label>
                          <div className="p-3 bg-muted rounded-lg mt-1">
                            <p className="whitespace-pre-wrap">{selectedReport.report_content}</p>
                          </div>
                        </div>

                        {selectedReport.has_documents && selectedReport.documents && selectedReport.documents.length > 0 && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Tài liệu đính kèm</Label>
                            <div className="mt-2 space-y-2">
                              {selectedReport.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                                  <div>
                                    <p className="font-medium flex items-center">
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      {doc.document_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {doc.file_type} • {formatFileSize(doc.file_size_kb)} • Tải lên ngày: {formatDateTime(doc.uploaded_at)}
                                    </p>
                                  </div>
                                  
                                  {doc.downloadUrl ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleDownloadDocument(doc.downloadUrl, doc.document_name)}
                                      className="flex items-center gap-1"
                                    >
                                      <Download className="h-4 w-4" />
                                      Tải xuống
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm" disabled>
                                      <span className="text-muted-foreground">Không có URL</span>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Thời gian gửi</Label>
                            <p className="font-medium">{formatDateTime(selectedReport.submitted_at)}</p>
                          </div>
                          
                          {selectedReport.reviewed_at && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Thời gian duyệt</Label>
                              <p className="font-medium">{formatDateTime(selectedReport.reviewed_at)}</p>
                            </div>
                          )}
                        </div>
                        
                        {selectedReport.review_comments && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Nhận xét</Label>
                            <div className="p-3 bg-muted rounded-lg mt-1">
                              <p className="whitespace-pre-wrap">{selectedReport.review_comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                        Đóng
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
