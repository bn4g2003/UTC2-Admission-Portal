import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Eye } from "lucide-react"

const news = [
  {
    id: 1,
    title: "Thông báo tuyển sinh đại học chính quy năm 2024",
    excerpt:
      "Trường Đại học Giao thông Vận tải - Phân hiệu tại TP.HCM thông báo tuyển sinh đại học chính quy năm 2024 với nhiều ngành đào tạo chất lượng cao.",
    date: "15/03/2024",
    category: "Tuyển sinh",
    image: "/images/imageThongBao.png",
    views: 1250,
    featured: true,
  },
  {
    id: 2,
    title: "Lễ khai giảng năm học 2024-2025",
    excerpt:
      "Lễ khai giảng năm học mới 2024-2025 sẽ được tổ chức trang trọng với sự tham dự của lãnh đạo nhà trường và toàn thể sinh viên.",
    date: "10/03/2024",
    category: "Sự kiện",
    image: "/images/KhaiGiang.png",
    views: 890,
    featured: false,
  },
  {
    id: 3,
    title: "Hội thảo khoa học quốc tế về giao thông thông minh",
    excerpt:
      "Nhà trường tổ chức hội thảo khoa học quốc tế về giao thông thông minh và phát triển bền vững với sự tham gia của các chuyên gia trong nước và quốc tế.",
    date: "08/03/2024",
    category: "Khoa học",
    image: "/images/HoiThao.png",
    views: 567,
    featured: false,
  },
  {
    id: 4,
    title: "Chương trình học bổng Merit 2024",
    excerpt:
      "Nhà trường công bố chương trình học bổng Merit 2024 dành cho sinh viên có thành tích học tập xuất sắc và hoàn cảnh khó khăn.",
    date: "05/03/2024",
    category: "Học bổng",
    image: "/images/merit.png",
    views: 1100,
    featured: false,
  },
]

export function NewsSection() {
  const featuredNews = news.find((item) => item.featured)
  const regularNews = news.filter((item) => !item.featured)

  return (
    <section className="py-20 bg-gray-50 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-4">TIN TỨC & SỰ KIỆN</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về hoạt động đào tạo, nghiên cứu và các sự kiện của nhà trường
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured News */}
          {featuredNews && (
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <div className="relative">
                  <img
                    src={featuredNews.image || "/placeholder.svg"}
                    alt={featuredNews.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-orange-500 text-white">{featuredNews.category}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {featuredNews.date}
                    <Eye className="h-4 w-4 ml-4 mr-2" />
                    {featuredNews.views} lượt xem
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a8a] mb-3 group-hover:text-orange-500 transition-colors">
                    {featuredNews.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{featuredNews.excerpt}</p>
                  <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
                    Đọc tiếp
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Regular News */}
          <div className="space-y-6">
            {regularNews.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex-1">
                    <Badge variant="secondary" className="text-xs mb-2">
                      {item.category}
                    </Badge>
                    <h4 className="font-semibold text-[#1e3a8a] mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.date}
                      <Eye className="h-3 w-3 ml-3 mr-1" />
                      {item.views}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
            >
              Xem tất cả tin tức
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
