import { Card, CardContent } from "@/components/ui/card"
import { Users, GraduationCap, Award, Building } from "lucide-react"

const stats = [
  {
    icon: Users,
    number: "15,000+",
    label: "Sinh viên",
    description: "Đang theo học tại trường",
  },
  {
    icon: GraduationCap,
    number: "50,000+",
    label: "Cử nhân",
    description: "Đã tốt nghiệp thành công",
  },
  {
    icon: Award,
    number: "25+",
    label: "Chương trình",
    description: "Đào tạo chất lượng cao",
  },
  {
    icon: Building,
    number: "30+",
    label: "Năm kinh nghiệm",
    description: "Trong lĩnh vực đào tạo",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-4">UTC2 TRONG CON SỐ</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những con số ấn tượng thể hiện sự phát triển và uy tín của nhà trường
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#1e3a8a] mb-2 group-hover:text-orange-500 transition-colors">
                    {stat.number}
                  </h3>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">{stat.label}</h4>
                  <p className="text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
