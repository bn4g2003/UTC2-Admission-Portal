import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Trophy, Globe2 } from "lucide-react"

const achievements = [
  {
    icon: BookOpen,
    title: "Chất lượng đào tạo",
    description: "Chương trình học tiên tiến, cập nhật, đáp ứng nhu cầu nguồn nhân lực chất lượng cao.",
    metric: "Đa dạng ngành", // Thay đổi cho phù hợp
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Đội ngũ giảng viên",
    description: "Đội ngũ giảng viên tâm huyết, giàu kinh nghiệm thực tiễn và chuyên môn cao.",
    metric: "100+ Giảng viên", // Ví dụ con số ước tính, bạn có thể thay đổi
    color: "bg-green-500",
  },
  {
    icon: Trophy,
    title: "Thành tựu sinh viên",
    description: "Nhiều sinh viên đạt giải thưởng cao trong các cuộc thi học thuật và sáng tạo.",
    metric: "Nhiều giải thưởng",
    color: "bg-purple-500",
  },
  {
    icon: Globe2,
    title: "Cơ hội việc làm",
    description: "Sinh viên tốt nghiệp có tỉ lệ việc làm cao, được các doanh nghiệp lớn tin tưởng.",
    metric: "Tỷ lệ cao",
    color: "bg-orange-500",
  },
]

export function AcademicExcellence() {
  return (
    <section className="py-24 bg-[#002147] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Asymmetric Header */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-8 transform lg:-skew-y-1">
            <Badge variant="secondary" className="bg-[#FFD700]/20 text-[#FFD700] mb-6">
              Điểm Sáng Học Thuật
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-sans leading-tight">
              Nơi Truyền Thống Kết Nối Tương Lai
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Phân hiệu Trường Đại học GTVT tại TP. Hồ Chí Minh tự hào là một trong những cơ sở đào tạo hàng đầu,
              không ngừng đổi mới để đào tạo ra những thế hệ kỹ sư và nhà quản lý chất lượng cao,
              đáp ứng yêu cầu phát triển của đất nước.
            </p>
          </div>
          <div className="lg:col-span-4 transform lg:skew-y-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FFD700] mb-2">Hơn 40</div>
                <div className="text-white text-lg">Năm phát triển</div>
                <div className="text-slate-300 text-sm mt-2">Kể từ khi thành lập</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Cards - Overlapping Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <Card
                key={index}
                className={`group hover:scale-105 transition-all duration-500 bg-white/10 backdrop-blur-lg border border-white/20 hover:border-[#FFD700]/50 cursor-pointer ${
                  index % 2 === 1 ? "lg:mt-12" : ""
                }`}
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${achievement.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
                        {achievement.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{achievement.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-2xl font-bold text-[#FFD700]">{achievement.metric}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}