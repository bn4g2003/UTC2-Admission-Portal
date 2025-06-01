"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Play, FileText, Users, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    id: 1,
    title: "CHÀO MỪNG ĐẾN VỚI UTC2 HỒ CHÍ MINH",
    subtitle: "Trường Đại học Giao thông Vận tải - Phân hiệu tại TP. Hồ Chí Minh",
    description: "Đào tạo nguồn nhân lực chất lượng cao trong lĩnh vực giao thông vận tải và công nghệ",
    image: "/images/background.jpeg",
    cta: "TUYỂN SINH 2024",
  },
  {
    id: 2,
    title: "CHƯƠNG TRÌNH ĐÀO TẠO CHẤT LƯỢNG CAO",
    subtitle: "Hợp tác quốc tế - Chuẩn đầu ra nghề nghiệp",
    description: "Các chương trình đào tạo được thiết kế theo chuẩn quốc tế với đội ngũ giảng viên giàu kinh nghiệm",
    image: "/images/background2.jpg",
    cta: "TÌM HIỂU THÊM",
  },
  {
    id: 3,
    title: "CƠ SỞ VẬT CHẤT HIỆN ĐẠI",
    subtitle: "Trang thiết bị tiên tiến - Môi trường học tập lý tưởng",
    description: "Hệ thống phòng lab, xưởng thực hành được trang bị công nghệ hiện đại phục vụ đào tạo",
    image: "/images/background3.png",
    cta: "KHÁM PHÁ NGAY",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[720px] "> {/* Tăng chiều cao của HeroSection */}
      {/* Slider */}
      <div className="relative h-[600px]"> {/* Giữ chiều cao cố định cho slider */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/50 to-[#1e3a8a]/60 z-10"></div>
            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl text-white">
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">{slide.title}</h1>
                  <h2 className="text-xl lg:text-2xl mb-6 text-blue-100">{slide.subtitle}</h2>
                  <p className="text-lg mb-8 text-blue-50 leading-relaxed">{slide.description}</p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <Link 
                      href="https://tuyensinh.utc2.edu.vn/vi" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="lg"
                        className="bg-[#FFCC00] text-[#003366] hover:bg-[#FFCC00]/90 font-semibold px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        Đăng ký ngay
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl">
                        <Play className="mr-2 h-5 w-5" />
                        Đăng nhập
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="lg"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Quick Access Cards */}
      {/* Vẫn giữ mt-[-100px] và z-50 để chồng lên slider */}
      <div className="relative mt-[-100px] z-50 mb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              href="https://tuyensinh.utc2.edu.vn/vi/thong-bao-tuyen-sinh-311" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a8a] mb-2">TUYỂN SINH 2024</h3>
                  <p className="text-gray-600 mb-4">Thông tin tuyển sinh và hướng dẫn đăng ký</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">XEM CHI TIẾT</Button>
                </div>
              </Card>
            </Link>

            <Link 
              href="https://tuyensinh.utc2.edu.vn/vi/nganh-dao-tao-309" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a8a] mb-2">CHƯƠNG TRÌNH ĐÀO TẠO</h3>
                  <p className="text-gray-600 mb-4">Các ngành đào tạo và chương trình học</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">KHÁM PHÁ</Button>
                </div>
              </Card>
            </Link>

            <Link 
              href="https://tuyensinh.utc2.edu.vn/vi/hoc-bong" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a8a] mb-2">HỌC BỔNG</h3>
                  <p className="text-gray-600 mb-4">Chính sách học bổng và hỗ trợ sinh viên</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">TÌM HIỂU</Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}