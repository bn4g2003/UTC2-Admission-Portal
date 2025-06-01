"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Microscope, Code, Palette, Calculator } from "lucide-react"
import Image from "next/image"

const programs = [
  {
    id: 1,
    title: "Engineering & Technology",
    description: "Cutting-edge programs in AI, robotics, and sustainable technology",
    icon: Code,
    image: "/placeholder.svg?height=400&width=600",
    stats: { students: "12K+", ranking: "#3 Global" },
    color: "from-blue-600 to-purple-600",
  },
  {
    id: 2,
    title: "Medical Sciences",
    description: "World-renowned medical school with state-of-the-art research facilities",
    icon: Microscope,
    image: "/placeholder.svg?height=400&width=600",
    stats: { students: "8K+", ranking: "#1 National" },
    color: "from-green-600 to-teal-600",
  },
  {
    id: 3,
    title: "Arts & Design",
    description: "Creative programs fostering innovation in digital and traditional arts",
    icon: Palette,
    image: "/placeholder.svg?height=400&width=600",
    stats: { students: "5K+", ranking: "#2 Regional" },
    color: "from-pink-600 to-rose-600",
  },
  {
    id: 4,
    title: "Business & Economics",
    description: "MBA and undergraduate programs with global industry partnerships",
    icon: Calculator,
    image: "/placeholder.svg?height=400&width=600",
    stats: { students: "15K+", ranking: "#5 Global" },
    color: "from-amber-600 to-orange-600",
  },
]

export function ProgramSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % programs.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + programs.length) % programs.length)
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23002147' fillOpacity='.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#002147]/10 rounded-full mb-6">
            <span className="text-[#002147] font-medium">Academic Excellence</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#002147] mb-6 font-serif">Program Spotlight</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover our world-class academic programs designed to shape tomorrow's leaders
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-4xl">
              {/* Navigation Buttons */}
              <Button
                onClick={prevSlide}
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border-[#002147]/20 hover:bg-[#002147] hover:text-white transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                onClick={nextSlide}
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border-[#002147]/20 hover:bg-[#002147] hover:text-white transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Cards Container */}
              <div className="relative h-96 flex items-center justify-center">
                {programs.map((program, index) => {
                  const offset = index - currentIndex
                  const isActive = offset === 0
                  const isVisible = Math.abs(offset) <= 1

                  if (!isVisible) return null

                  const Icon = program.icon

                  return (
                    <Card
                      key={program.id}
                      className={`absolute w-80 h-80 transition-all duration-700 ease-out cursor-pointer group ${
                        isActive
                          ? "z-10 scale-100 rotate-y-0 opacity-100"
                          : offset > 0
                            ? "z-5 scale-75 rotate-y-12 opacity-60 translate-x-32"
                            : "z-5 scale-75 rotate-y-[-12deg] opacity-60 -translate-x-32"
                      }`}
                      style={{
                        transform: `
                          translateX(${offset * 120}px) 
                          rotateY(${offset * 15}deg) 
                          scale(${isActive ? 1 : 0.8})
                        `,
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <CardContent className="p-0 h-full relative overflow-hidden rounded-xl">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={program.image || "/placeholder.svg"}
                            alt={program.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${program.color} opacity-80`}></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                          <div>
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4">
                              <Icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 font-serif">{program.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed">{program.description}</p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span>{program.stats.students} Students</span>
                              <span>{program.stats.ranking}</span>
                            </div>
                            <Button
                              variant="secondary"
                              className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-[#002147] transition-all duration-300"
                            >
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-[#002147] scale-125" : "bg-[#002147]/30 hover:bg-[#002147]/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
