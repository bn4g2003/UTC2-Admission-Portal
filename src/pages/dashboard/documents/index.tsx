"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Download,
  Trash2,
  ArrowLeft,
  User,
  Search,
  Calendar,
  HardDrive,
  Upload,
  File,
  Filter,
  FolderOpen,
  FileText,
} from "lucide-react"
import AppSidebar from "@/components/app-sidebar"

interface Document {
  id: string
  document_name: string
  file_type: string
  file_size_kb: number
  uploaded_at: string
  uploaded_by_name: string
  downloadUrl: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState("all")

  const fetchDocuments = async () => {
    const docsResponse = await fetch("/api/documents", {
      credentials: "include",
    })

    if (!docsResponse.ok) {
      throw new Error("Failed to fetch documents")
    }

    const docsData = await docsResponse.json()
    setDocuments(docsData)
  }

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true)
        setError("")

        // First check authentication
        const authResponse = await fetch("/api/auth/check", {
          credentials: "include",
        })

        if (!authResponse.ok) {
          if (authResponse.status === 401) {
            router.push("/auth/login")
            return
          }
          throw new Error("Authentication check failed")
        }

        const authData = await authResponse.json()
        if (!authData || typeof authData.role !== "string") {
          throw new Error("Invalid authentication response")
        }

        setUserRole(authData.role)

        // Then fetch documents
        await fetchDocuments()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
        console.error("Error initializing page:", err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1]

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            file: base64Data,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
          }),
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        setIsUploadDialogOpen(false)
        setSelectedFile(null)
        fetchDocuments()
      }
    } catch (error) {
      console.error("Error uploading:", error)
      setError("Không thể tải lên tài liệu")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Delete failed")

      fetchDocuments()
    } catch (error) {
      console.error("Error deleting:", error)
      setError("Không thể xóa tài liệu")
    }
  }

  const handleDownload = async (doc: Document) => {
    if (!doc.downloadUrl) {
      setError("Không thể tải xuống tài liệu này")
      return
    }

    try {
      const a = document.createElement("a")
      a.href = doc.downloadUrl
      a.download = doc.document_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading:", error)
      setError("Lỗi khi tải xuống tài liệu")
    }
  }

  const formatFileSize = (sizeInKb: number) => {
    if (sizeInKb < 1024) return `${sizeInKb} KB`
    return `${(sizeInKb / 1024).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word") || fileType.includes("doc")) return "📝"
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊"
    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("video")) return "🎥"
    return "📁"
  }

  const getDocumentStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.file_size_kb, 0)
    const fileTypes = [...new Set(documents.map((doc) => doc.file_type))]
    const recentDocs = documents.filter((doc) => {
      const uploadDate = new Date(doc.uploaded_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate > weekAgo
    })

    return {
      total: documents.length,
      totalSize: formatFileSize(totalSize),
      fileTypes: fileTypes.length,
      recent: recentDocs.length,
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = fileTypeFilter === "all" || doc.file_type.includes(fileTypeFilter)
    return matchesSearch && matchesType
  })

  const stats = getDocumentStats()
  const uniqueFileTypes = [...new Set(documents.map((doc) => doc.file_type))]

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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Tài liệu</h1>
                    <p className="text-muted-foreground">Quản lý và chia sẻ tài liệu trong hệ thống tuyển sinh</p>
                  </div>
                  {userRole === "TRUONGBAN" && (
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Tải lên tài liệu
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tải lên Tài liệu Mới</DialogTitle>
                          <DialogDescription>
                            Chọn file tài liệu bạn muốn tải lên hệ thống để chia sẻ với giảng viên.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="file">Chọn file tài liệu</Label>
                            <Input
                              id="file"
                              type="file"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                            />
                            {selectedFile && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <File className="w-4 h-4" />
                                <span className="text-sm">{selectedFile.name}</span>
                                <Badge variant="outline" className="ml-auto">
                                  {formatFileSize(selectedFile.size / 1024)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                            Hủy
                          </Button>
                          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Tải lên
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng tài liệu</CardTitle>
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Dung lượng</CardTitle>
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSize}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Loại file</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.fileTypes}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Mới tuần này</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.recent}</div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Search and Filter */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Tìm kiếm và lọc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Tìm kiếm theo tên tài liệu hoặc người tải lên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="w-48">
                        <select
                          value={fileTypeFilter}
                          onChange={(e) => setFileTypeFilter(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="all">Tất cả loại file</option>
                          {uniqueFileTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách tài liệu ({filteredDocuments.length} tài liệu)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên tài liệu</TableHead>
                          <TableHead>Loại file</TableHead>
                          <TableHead>Kích thước</TableHead>
                          <TableHead>Người tải lên</TableHead>
                          <TableHead>Ngày tải lên</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              {documents.length === 0
                                ? "Chưa có tài liệu nào"
                                : "Không có tài liệu nào phù hợp với bộ lọc"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getFileIcon(doc.file_type)}</span>
                                  <span className="truncate max-w-[200px]" title={doc.document_name}>
                                    {doc.document_name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.file_type}</Badge>
                              </TableCell>
                              <TableCell>{formatFileSize(doc.file_size_kb)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {doc.uploaded_by_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDate(doc.uploaded_at)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(doc)}
                                    disabled={!doc.downloadUrl}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Tải xuống
                                  </Button>
                                  {userRole === "TRUONGBAN" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(doc.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
