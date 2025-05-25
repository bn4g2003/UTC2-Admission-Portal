import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, DollarSign, Users } from "lucide-react"

const admissionSteps = [
  {
    icon: FileText,
    title: "Nộp hồ sơ xét tuyển",
    description: "Hoàn tất hồ sơ đăng ký xét tuyển trực tuyến cùng các giấy tờ cần thiết.",
    action: "Đăng ký ngay",
    color: "from-blue-600 to-blue-700",
    link: "/tuyen-sinh/dang-ky" // Thêm liên kết đến trang đăng ký
  },
  {
    icon: DollarSign,
    title: "Học phí & Học bổng",
    description: "Tìm hiểu chi tiết về mức học phí và các chính sách học bổng đa dạng.",
    action: "Tìm hiểu thêm",
    color: "from-green-600 to-green-700",
    link: "/tuyen-sinh/hoc-phi-hoc-bong" // Thêm liên kết đến trang học phí/học bổng
  },
  {
    icon: Calendar,
    title: "Lịch trình tuyển sinh",
    description: "Cập nhật các mốc thời gian quan trọng, hạn nộp hồ sơ và lịch phỏng vấn/xét tuyển.",
    action: "Xem chi tiết",
    color: "from-purple-600 to-purple-700",
    link: "/tuyen-sinh/lich-trinh" // Thêm liên kết đến trang lịch trình
  },
  {
    icon: Users,
    title: "Cuộc sống sinh viên",
    description: "Khám phá môi trường học tập năng động, câu lạc bộ và hoạt động ngoại khóa tại Phân hiệu.",
    action: "Khám phá",
    color: "from-orange-600 to-orange-700",
    link: "/cuoc-song-sinh-vien" // Thêm liên kết đến trang cuộc sống sinh viên
  },
]

export function AdmissionCards() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] relative overflow-hidden">
      {/* Các yếu tố trang trí */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#002147] mb-6 font-sans">Bắt đầu hành trình của bạn</h2>
          <p className="text-xl text-[#002147]/80 max-w-3xl mx-auto">
            Hãy cùng Phân hiệu Trường Đại học Giao thông vận tải tại TP. Hồ Chí Minh xây dựng tương lai vững chắc!
          </p>
        </div>

        {/* Bố cục thẻ chéo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {admissionSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card
                key={index}
                className={`group hover:scale-105 transition-all duration-500 bg-white shadow-2xl hover:shadow-3xl cursor-pointer border-0 ${
                  index % 2 === 1 ? "lg:mt-12" : ""
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-[#002147] mb-4 group-hover:text-[#003366] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>

                  {/* Sử dụng thẻ 'a' hoặc Link của Next.js để điều hướng */}
                  <a href={step.link} className="block"> 
                    <Button className="w-full bg-[#002147] hover:bg-[#003366] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      {step.action}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Kêu gọi hành động */}
        <div className="text-center mt-16">
          <Card className="bg-white/20 backdrop-blur-lg border border-white/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#002147] mb-4">Sẵn sàng nộp hồ sơ?</h3>
              <p className="text-[#002147]/80 mb-6">
                Hãy gia nhập cộng đồng sinh viên năng động của Phân hiệu Trường Đại học Giao thông vận tải tại TP. Hồ Chí Minh!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/tuyen-sinh/dang-ky">
                  <Button size="lg" className="bg-[#002147] hover:bg-[#003366] text-white px-8">
                    Bắt đầu đăng ký
                  </Button>
                </a>
                <a href="/tuyen-sinh/tu-van"> {/* Giả định có trang tư vấn hoặc liên hệ */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white px-8"
                  >
                    Đăng ký tư vấn
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}