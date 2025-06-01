import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, DollarSign, Users } from "lucide-react"

const admissionSteps = [
  {
    icon: FileText,
    title: "Application",
    description: "Submit your online application with required documents",
    action: "Apply Now",
    color: "from-blue-600 to-blue-700",
  },
  {
    icon: DollarSign,
    title: "Financial Aid",
    description: "Explore scholarships and financial assistance options",
    action: "Learn More",
    color: "from-green-600 to-green-700",
  },
  {
    icon: Calendar,
    title: "Important Dates",
    description: "Stay updated with application deadlines and events",
    action: "View Calendar",
    color: "from-purple-600 to-purple-700",
  },
  {
    icon: Users,
    title: "Student Life",
    description: "Discover campus culture, clubs, and activities",
    action: "Explore",
    color: "from-orange-600 to-orange-700",
  },
]

export function AdmissionCards() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#002147] mb-6 font-serif">Start Your Journey</h2>
          <p className="text-xl text-[#002147]/80 max-w-3xl mx-auto">
            Take the first step towards your future at UTC2 University
          </p>
        </div>

        {/* Diagonal Grid Layout */}
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

                  <Button className="w-full bg-[#002147] hover:bg-[#003366] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    {step.action}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-white/20 backdrop-blur-lg border border-white/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#002147] mb-4">Ready to Apply?</h3>
              <p className="text-[#002147]/80 mb-6">
                Join thousands of students who have chosen UTC2 University for their academic journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#002147] hover:bg-[#003366] text-white px-8">
                  Start Application
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white px-8"
                >
                  Schedule Visit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
