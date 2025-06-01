import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Trophy, Globe2 } from "lucide-react"

const achievements = [
  {
    icon: BookOpen,
    title: "Research Excellence",
    description: "Over 2,000 published papers annually with groundbreaking discoveries",
    metric: "2K+ Papers",
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Faculty Excellence",
    description: "Nobel laureates and industry leaders shaping the future",
    metric: "500+ Faculty",
    color: "bg-green-500",
  },
  {
    icon: Trophy,
    title: "Global Rankings",
    description: "Consistently ranked among top 10 universities worldwide",
    metric: "Top 10",
    color: "bg-purple-500",
  },
  {
    icon: Globe2,
    title: "International Reach",
    description: "Students from 120+ countries creating a diverse community",
    metric: "120+ Countries",
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
              Academic Excellence
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-serif leading-tight">
              Where Tradition Meets Innovation
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              For over a century, UTC2 University has been at the forefront of academic excellence, fostering innovation
              and shaping leaders who transform the world.
            </p>
          </div>
          <div className="lg:col-span-4 transform lg:skew-y-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FFD700] mb-2">125+</div>
                <div className="text-white text-lg">Years of Excellence</div>
                <div className="text-slate-300 text-sm mt-2">Since 1899</div>
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
