import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Clock } from "lucide-react"

const programs = [
  {
    id: 1,
    name: "Khai thác vận tải",
    code: "KTVTVT",
    duration: "4 năm",
    students: "150 sinh viên/khóa",
    description: "Khai thác vận tải là ngành học nghiên cứu hoạt động quy hoạch, tổ chức, lên kế hoạch, quản lý, khai thác và kinh doanh vận tải ở cả cấp độ vi mô và vĩ mô.",
    image: "/images/NganhHoc/KhaiThacVanTai.png",
    featured: false,
  },
  {
    id: 2,
    name: "Kỹ thuật Ô tô",
    code: "KTOTO",
    duration: "4 năm",
    students: "120 sinh viên/khóa",
    description: "Chuyên ngành đào tạo kỹ sư thiết kế, chế tạo và bảo dưỡng phương tiện giao thông",
    image: "/images/NganhHoc/KyThuatOto.png",
    featured: false,
  },
  {
    id: 3,
    name: "Logistics và Quản lý chuỗi cung ứng",
    code: "LOG",
    duration: "4 năm",
    students: "100 sinh viên/khóa",
    description: "Đào tạo chuyên gia logistics và quản lý chuỗi cung ứng cho các doanh nghiệp",
    image: "/images/NganhHoc/Logisrics.png",
    featured: false,
  },
  {
    id: 4,
    name: "Kỹ thuật cơ khí động lực",
    code: "KTCKDL",
    duration: "4 năm",
    students: "80 sinh viên/khóa",
    description: "Kỹ sư Kỹ thuật cơ khí động lực được trang bị đầy đủ kiến thức cơ bản, thành thạo về chuyên môn",
    image: "/images/NganhHoc/CoKhiDongLuc.png",
    featured: false,
  },
  {
    id: 5,
    name: "Công nghệ Thông tin",
    code: "CNTT",
    duration: "4 năm",
    students: "200 sinh viên/khóa",
    description: "Đào tạo kỹ sư CNTT ứng dụng trong giao thông thông minh và logistics",
    image: "/images/NganhHoc/CNTT.png",
    featured: false,
  },
  {
    id: 6,
    name: "Kỹ thuật Xây dựng",
    code: "KTXD",
    duration: "4 năm",
    students: "90 sinh viên/khóa",
    description: "Chuyên về thiết kế và thi công các công trình giao thông và hạ tầng",
    image: "/images/NganhHoc/KTXayDung.png",
    featured: false,
  },
]

export function ProgramsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-4">CHƯƠNG TRÌNH ĐÀO TẠO</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Các chương trình đào tạo đa dạng, chất lượng cao đáp ứng nhu cầu phát triển của xã hội
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <Card
              key={program.id}
              className={`overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer ${program.featured ? "ring-2 ring-orange-500" : ""}`}
            >
              <div className="relative">
                <img
                  src={program.image || "/placeholder.svg"}
                  alt={program.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {program.featured && <Badge className="absolute top-4 right-4 bg-orange-500 text-white">Nổi bật</Badge>}
                <div className="absolute top-4 left-4 bg-[#1e3a8a] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {program.code}
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#1e3a8a] mb-3 group-hover:text-orange-500 transition-colors">
                  {program.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    Thời gian: {program.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-orange-500" />
                    Quy mô: {program.students}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Chi tiết
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    Đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white px-8"
          >
            Xem tất cả chương trình đào tạo
          </Button>
        </div>
      </div>
    </section>
  )
}
