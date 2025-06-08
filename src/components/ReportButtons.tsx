
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Loader2, Download, Eye, TrendingUp, Users, BarChart3 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
// import html2pdf from "html2pdf.js" // XÓA DÒNG NÀY
// import { marked } from "marked"; // XÓA DÒNG NÀY (sẽ import động bên trong hàm)


export default function ReportButtons() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [reportDialog, setReportDialog] = useState<{
    isOpen: boolean
    title: string
    content: string
    type: string
  }>({
    isOpen: false,
    title: "",
    content: "",
    type: "",
  })

  const generateReport = async (type: "plans" | "teachers" | "overview") => {
    setIsGenerating(type)
    try {
      const response = await fetch(`/api/generateReport/${type}`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()

      // Show the report in a dialog
      setReportDialog({
        isOpen: true,
        title: getReportTitle(type),
        content: data.report,
        type: type,
      })

      toast({
        title: "Báo cáo đã được tạo",
        description: "Báo cáo đã được tạo thành công.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(null)
    }
  }

  const getReportTitle = (type: string) => {
    switch (type) {
      case "plans":
        return "Báo cáo Kế hoạch Tuyển sinh"
      case "teachers":
        return "Báo cáo Hiệu suất Giáo viên"
      case "overview":
        return "Báo cáo Tổng quan Hệ thống"
      default:
        return "Báo cáo"
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "plans":
        return <TrendingUp className="w-5 h-5" />
      case "teachers":
        return <Users className="w-5 h-5" />
      case "overview":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <FileSpreadsheet className="w-5 h-5" />
    }
  }

  const getReportDescription = (type: string) => {
    switch (type) {
      case "plans":
        return "Phân tích chi tiết về các kế hoạch tuyển sinh và tiến độ thực hiện"
      case "teachers":
        return "Đánh giá hiệu suất và năng suất làm việc của giáo viên"
      case "overview":
        return "Tổng quan toàn diện về hoạt động và hiệu quả hệ thống"
      default:
        return "Báo cáo chi tiết"
    }
  }

  const downloadReport = async () => { // Đảm bảo hàm này là async
    // Tạo một phần tử tạm để render HTML từ Markdown
    const tempDiv = document.createElement("div")
    tempDiv.style.padding = "24px"
    tempDiv.style.fontFamily = "sans-serif"
    tempDiv.style.lineHeight = "1.6"
    tempDiv.className = "prose" // giữ style đẹp nếu dùng Tailwind Typography

    try {
      // Dùng `marked` để chuyển Markdown sang HTML
      const { marked } = await import("marked") // Import marked động
      tempDiv.innerHTML = marked.parse(reportDialog.content) as string

      // Import html2pdf.js động
      const html2pdf = (await import("html2pdf.js")).default; // Lấy default export

      // Cấu hình xuất PDF
      const opt = {
        margin: 0.5,
        filename: `${reportDialog.type}-report-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(tempDiv).save(); // Await hàm save
      toast({
        title: "Tải PDF thành công",
        description: "Báo cáo đã được lưu dưới dạng PDF.",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải báo cáo PDF. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const reportTypes = [
    {
      type: "plans" as const,
      title: "Kế hoạch Tuyển sinh",
      description: "Phân tích tiến độ và hiệu quả các kế hoạch tuyển sinh",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      type: "teachers" as const,
      title: "Hiệu suất Giáo viên",
      description: "Đánh giá năng suất và chất lượng công việc giáo viên",
      icon: <Users className="w-5 h-5" />,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      type: "overview" as const,
      title: "Tổng quan Hệ thống",
      description: "Báo cáo toàn diện về hoạt động và thống kê hệ thống",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card
            key={report.type}
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${report.color} text-white`}>{report.icon}</div>
                <Badge variant="secondary" className="text-xs">
                  Auto-generated
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{report.description}</p>
              <Button
                className={`w-full ${report.color} ${report.hoverColor} text-white border-0`}
                onClick={() => generateReport(report.type)}
                disabled={!!isGenerating}
              >
                {isGenerating === report.type ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo báo cáo...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Tạo báo cáo
                  </>
                )}
              </Button>
            </CardContent>

            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      <Dialog
        open={reportDialog.isOpen}
        onOpenChange={(open) => setReportDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              {getReportIcon(reportDialog.type)}
              <div>
                <DialogTitle className="text-xl">{reportDialog.title}</DialogTitle>
                <DialogDescription className="mt-1">{getReportDescription(reportDialog.type)}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-center underline">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-3 text-center">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium mb-2 text-left">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-justify text-[15px] leading-[1.8] font-serif">{children}</p>
                    ),
                    ul: ({ children }) => <ul className="mb-4 pl-6 list-disc space-y-1 text-[15px]">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal space-y-1 text-[15px]">{children}</ol>,
                    li: ({ children }) => <li className="text-justify">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-black border-collapse text-sm font-serif">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                    th: ({ children }) => (
                      <th className="border border-black px-3 py-2 text-center font-medium">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-black px-3 py-2 text-justify">{children}</td>
                    ),
                  }}
                >
                  {reportDialog.content}
              </ReactMarkdown>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setReportDialog((prev) => ({ ...prev, isOpen: false }))}>
              <Eye className="mr-2 h-4 w-4" />
              Đóng
            </Button>
            <Button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="mr-2 h-4 w-4" />
              Tải xuống
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}