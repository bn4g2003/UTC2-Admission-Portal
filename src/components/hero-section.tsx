// HeroSection.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button" // Đảm bảo đường dẫn này đúng
import { Card } from "@/components/ui/card"     // Đảm bảo đường dẫn này đúng
import { Play, ArrowRight, BookOpen, GraduationCap, Briefcase, LogIn } from "lucide-react" // Import icon LogIn

// Mảng chứa các URL hình nền
const backgroundImages = [
  "/images/background.jpeg",
  "/images/background2.jpg",
  "/images/background3.png"
];

const backgroundInterval = 8000;

export function HeroSection() {
  const mottoRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    // Kinetic typography animation
    if (mottoRef.current) {
      const letters = mottoRef.current.textContent?.split("") || []
      mottoRef.current.innerHTML = letters
        .map(
          (letter, i) =>
            `<span class="inline-block animate-pulse" style="animation-delay: ${i * 0.1}s">${letter === " " ? "&nbsp;" : letter}</span>`,
        )
        .join("")
    }

    // Floating cards animation
    if (cardsRef.current) {
      const cards = cardsRef.current.children
      Array.from(cards).forEach((card, i) => {
        const element = card as HTMLElement
        element.style.animationDelay = `${i * 0.5}s`
        element.classList.add("animate-float")
      })
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Cập nhật index của hình nền tiếp theo
      setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, backgroundInterval);

    // Cleanup function để xóa interval khi component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array để interval chỉ chạy một lần khi component mount

  // Lấy URL của hình nền hiện tại
  const currentBackground = backgroundImages[currentBackgroundIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#003366] via-[#002147] to-[#001a33]">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[#002147]/70 z-10 absolute"></div>
        <div
          className="w-full h-full bg-cover bg-center bg-fixed transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url('${currentBackground}')` }}
        ></div>
      </div>
      {/* Logo và tên trường */}
      <div className="absolute top-8 left-6 z-30 flex items-center space-x-3">
        <img
          src="/images/LogoUTC2.png"
          alt="UTC2 Logo"
          className="h-12 w-auto object-contain"
        />
        <div className="text-white leading-tight text-sm lg:text-base">
          <div className="font-semibold">Trường Đại học Giao thông Vận tải</div>
          <div className="font-light text-[#FFCC00]">Phân hiệu tại TP. Hồ Chí Minh</div>
        </div>
      </div>


      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 flex flex-col lg:flex-row gap-8 items-stretch pt-32 pb-16">
        {/* Left Content - Khung mờ thứ nhất */}
        <div className="flex-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 h-full flex flex-col">
            <div className="space-y-6 mb-8 flex-grow">
              <div className="inline-block px-4 py-2 bg-[#FFCC00]/20 backdrop-blur-sm rounded-full border border-[#FFCC00]/30">
                <span className="text-[#FFCC00] text-sm font-medium">Tuyển sinh 2025 - Đợt 1</span>
              </div>

              <h1
                ref={mottoRef}
                className="text-4xl lg:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Kiến tạo tương lai cùng UTC2
              </h1>

              <p className="text-lg text-slate-300 max-w-full leading-relaxed">
                Phân hiệu Trường Đại học Giao thông vận tải tại TP. Hồ Chí Minh - Nơi đào tạo nguồn nhân lực chất lượng cao
                trong lĩnh vực Giao thông vận tải, Logistics, và Công nghệ.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/tuyen-sinh/dang-ky">
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFCC00]">Hơn 10K</div>
                <div className="text-slate-300 text-sm">Sinh viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFCC00]">35+</div>
                <div className="text-slate-300 text-sm">Năm hình thành</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFCC00]">15+</div>
                <div className="text-slate-300 text-sm">Ngành đào tạo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Floating Glass Cards - Khung mờ thứ hai */}
        <div className="flex-1 lg:block hidden">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 h-full flex flex-col justify-center">
            <div ref={cardsRef} className="space-y-6">
              <Link href="/tuyen-sinh/dai-hoc-chinh-quy">
                <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:rotate-1 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#FFCC00]/20 rounded-xl">
                      <BookOpen className="h-6 w-6 text-[#FFCC00]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Đại học chính quy</h3>
                      <p className="text-slate-300 text-sm">Xét tuyển bằng điểm thi THPT & học bạ</p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-[#FFCC00] text-sm font-medium group-hover:underline">Xem chi tiết →</span>
                  </div>
                </Card>
              </Link>

              <Link href="/tuyen-sinh/sau-dai-hoc">
                <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-rotate-1 cursor-pointer group ml-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#FFCC00]/20 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-[#FFCC00]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Sau đại học</h3>
                      <p className="text-slate-300 text-sm">Thạc sĩ, Tiến sĩ các chuyên ngành</p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-[#FFCC00] text-sm font-medium group-hover:underline">Xem chi tiết →</span>
                  </div>
                </Card>
              </Link>

              <Link href="/tuyen-sinh/lien-thong-vlwl">
                <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:rotate-1 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#FFCC00]/20 rounded-xl">
                      <Briefcase className="h-6 w-6 text-[#FFCC00]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Liên thông - Vừa làm vừa học</h3>
                      <p className="text-slate-300 text-sm">Đào tạo linh hoạt theo nhu cầu xã hội</p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-[#FFCC00] text-sm font-medium group-hover:underline">Xem chi tiết →</span>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-[#FFCC00]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#FFCC00]/5 rounded-full blur-3xl"></div>
    </section>
  )
}