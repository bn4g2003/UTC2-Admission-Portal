import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Users, Award, Download, ExternalLink } from "lucide-react"

const admissionInfo = [
  {
    title: "Thông báo tuyển sinh",
    description: "Thông tin chi tiết về phương thức tuyển sinh năm 2024",
    icon: FileText,
    color: "bg-blue-500",
    link: "#",
  },
  {
    title: "Lịch tuyển sinh",
    description: "Lịch trình các đợt tuyển sinh và thời gian nộp hồ sơ",
    icon: Calendar,
    color: "bg-green-500",
    link: "#",
  },
  {
    title: "Chỉ tiêu tuyển sinh",
    description: "Chỉ tiêu tuyển sinh các ngành đào tạo năm 2024",
    icon: Users,
    color: "bg-purple-500",
    link: "#",
  },
  {
    title: "Học bổng",
    description: "Thông tin về các loại học bổng và chính sách hỗ trợ",
    icon: Award,
    color: "bg-orange-500",
    link: "#",
  },
]

const documents = [
  {
    name: "Thông báo tuyển sinh 2024",
    size: "2.5 MB",
    type: "PDF",
    downloads: 1250,
  },
  {
    name: "Hướng dẫn đăng ký xét tuyển",
    size: "1.8 MB",
    type: "PDF",
    downloads: 890,
  },
  {
    name: "Danh sách ngành đào tạo",
    size: "3.2 MB",
    type: "PDF",
    downloads: 567,
  },
]

export function AdmissionSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">THÔNG TIN TUYỂN SINH</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Tất cả thông tin cần thiết cho quá trình đăng ký xét tuyển vào trường
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Admission Info Cards */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {admissionInfo.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card
                    key={index}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-blue-100 mb-4">{item.description}</p>
                      <Button variant="outline" className="text-white hover:bg-white/20 p-0">
                        Xem chi tiết
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* CTA Section */}
            <Card className="bg-orange-400 border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">SẴN SÀNG ĐĂNG KÝ XÉT TUYỂN?</h3>
                <p className="text-orange-100 mb-6">Bắt đầu hành trình học tập tại UTC2 ngay hôm nay</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                    ĐĂNG KÝ XÉT TUYỂN
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-orange-500"
                  >
                    TƯ VẤN TRỰC TUYẾN
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Download */}
          <div>
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  TÀI LIỆU TUYỂN SINH
                </h3>

                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                            {doc.name}
                          </h4>
                          <div className="flex items-center text-sm text-blue-200 mt-1">
                            <Badge variant="secondary" className="mr-2 text-xs">
                              {doc.type}
                            </Badge>
                            <span>{doc.size}</span>
                          </div>
                          <p className="text-xs text-blue-300 mt-1">{doc.downloads} lượt tải</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-white hover:bg-white/20">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  Xem tất cả tài liệu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
