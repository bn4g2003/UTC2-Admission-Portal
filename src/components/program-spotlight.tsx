"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Car, Ship, Plane, Construction, Landmark, Cable, BriefcaseBusiness, PackageOpen } from "lucide-react"
import Image from "next/image"

const programs = [
  {
    id: 1,
    title: "Kỹ thuật Xây dựng Công trình Giao thông",
    description: "Đào tạo kỹ sư thiết kế, thi công và quản lý hệ thống hạ tầng giao thông bền vững.",
    icon: Construction,
    image: "/images/nganh-xay-dung.jpg", // Đảm bảo hình ảnh tồn tại trong public/images/
    stats: { students: "2.500+ SV", ranking: "Ngành chủ lực" },
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: 2,
    title: "Kỹ thuật Ô tô & Giao thông thông minh",
    description: "Chuyên sâu về công nghệ ô tô, xe điện và hệ thống giao thông thông minh (ITS).",
    icon: Car,
    image: "/images/nganh-oto.jpg", // Đảm bảo hình ảnh tồn tại
    stats: { students: "1.800+ SV", ranking: "Mạng lưới đối tác rộng" },
    color: "from-red-600 to-amber-600",
  },
  {
    id: 3,
    title: "Kỹ thuật Hàng hải & Vận tải biển",
    description: "Đào tạo thuyền trưởng, máy trưởng và chuyên gia quản lý vận tải biển quốc tế.",
    icon: Ship,
    image: "/images/nganh-hang-hai.jpg", // Đảm bảo hình ảnh tồn tại
    stats: { students: "1.000+ SV", ranking: "Cơ hội việc làm toàn cầu" },
    color: "from-indigo-600 to-blue-600",
  },
  {
    id: 4,
    title: "Quản lý Vận tải & Logistics Đa phương thức",
    description: "Chương trình tích hợp công nghệ quản lý chuỗi cung ứng và logistics hiện đại.",
    icon: PackageOpen, // Thay đổi icon cho phù hợp hơn với Logistics
    image: "/images/nganh-logistics.jpg", // Đảm bảo hình ảnh tồn tại
    stats: { students: "1.500+ SV", ranking: "Top đầu tại TP.HCM" },
    color: "from-purple-600 to-pink-600",
  },
  {
    id: 5,
    title: "Kỹ thuật Điều khiển & Tự động hóa",
    description: "Đào tạo kỹ sư thiết kế, vận hành hệ thống điều khiển tự động trong công nghiệp.",
    icon: Cable, // Icon mới
    image: "/images/nganh-tudonghoa.jpg", // Đảm bảo hình ảnh tồn tại
    stats: { students: "900+ SV", ranking: "Công nghệ 4.0" },
    color: "from-green-600 to-teal-600",
  },
  {
    id: 6,
    title: "Kỹ thuật Môi trường & Đô thị",
    description: "Phát triển giải pháp kỹ thuật bền vững cho môi trường và hạ tầng đô thị.",
    icon: Landmark, // Icon mới
    image: "/images/nganh-moitruong.jpg", // Đảm bảo hình ảnh tồn tại
    stats: { students: "700+ SV", ranking: "Đóng góp xã hội" },
    color: "from-orange-500 to-yellow-500",
  },
]

export function ProgramSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Số lượng thẻ hiển thị cùng lúc (tùy chỉnh)
  const cardsToShow = 5 // Ví dụ: 1 thẻ trung tâm, 2 thẻ mỗi bên

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % programs.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + programs.length) % programs.length)
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23003366' fillOpacity='.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-[#003366]/10 rounded-full mb-4">
            <span className="text-[#003366] font-medium">Đào tạo đa ngành</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-[#003366] mb-4">Các ngành đào tạo nổi bật</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Chương trình đào tạo chất lượng cao theo tiêu chuẩn quốc tế, đáp ứng nhu cầu xã hội.
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-5xl lg:max-w-7xl"> {/* Tăng max-width để chứa nhiều thẻ hơn */}
              {/* Navigation Buttons */}
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border-[#003366]/20 hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border-[#003366]/20 hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Cards Container */}
              {/* Điều chỉnh h-96 thành h-100 hoặc h-[28rem] để thẻ có chiều cao lớn hơn */}
              <div className="relative h-[26rem] flex items-center justify-center">
                {programs.map((program, index) => {
                  // Tính toán vị trí tương đối của thẻ so với currentIndex
                  let offset = index - currentIndex;
                  // Xử lý vòng lặp cho carousel
                  if (offset > programs.length / 2) {
                    offset -= programs.length;
                  } else if (offset < -programs.length / 2) {
                    offset += programs.length;
                  }

                  const isActive = offset === 0;
                  // Hiển thị các thẻ trong phạm vi cardsToShow/2 ở mỗi bên của thẻ trung tâm
                  const isVisible = Math.abs(offset) <= Math.floor(cardsToShow / 2);

                  if (!isVisible) return null;

                  const Icon = program.icon;

                  // Điều chỉnh transform cho hiệu ứng 3D và vị trí
                  const translateX = offset * 200; // Tăng khoảng cách giữa các thẻ
                  const rotateY = offset * 10; // Giảm góc xoay để nhìn rõ hơn
                  const scale = isActive ? 1 : (1 - Math.abs(offset) * 0.15); // Giảm scale nhẹ nhàng hơn
                  // Opacity: Thẻ active (offset 0) là 1, các thẻ xa hơn sẽ mờ hơn
                  const opacity = isActive ? 1 : (0.5 + (1 - Math.abs(offset) * 0.5)); // Điều chỉnh độ đậm nhạt
                  const zIndex = isActive ? 20 : (10 - Math.abs(offset)); // Đảm bảo thẻ active ở trên cùng

                  return (
                    <Card
                      key={program.id}
                      className={`absolute w-[24rem] h-[24rem] transition-all duration-700 ease-out cursor-pointer group rounded-xl overflow-hidden`} // Tăng chiều ngang (w) và chiều cao (h) của thẻ
                      style={{
                        transform: `
                          translateX(${translateX}px)
                          rotateY(${rotateY}deg)
                          scale(${scale})
                        `,
                        transformStyle: "preserve-3d",
                        opacity: opacity, // Sử dụng opacity đã tính toán
                        zIndex: zIndex,
                        left: '50%', // Căn giữa
                        top: '50%', // Căn giữa
                        transformOrigin: 'center center', // Đảm bảo transform từ tâm
                        marginLeft: '-12rem', // offset 1/2 chiều rộng thẻ để căn giữa
                        marginTop: '-12rem', // offset 1/2 chiều cao thẻ để căn giữa
                      }}
                    >
                      <CardContent className="p-0 h-full relative overflow-hidden">
                        {/* Background Gradient - Giữ lại để tạo màu sắc cho card */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${program.color} opacity-90`}></div>

                        {/* Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                          <div>
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-3">
                              <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{program.title}</h3> {/* Tăng kích thước tiêu đề */}
                            <p className="text-white/90 text-base leading-relaxed">{program.description}</p> {/* Tăng kích thước mô tả */}
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium"> {/* Tăng kích thước chữ stats */}
                              <span>{program.stats.students}</span>
                              <span>{program.stats.ranking}</span>
                            </div>
                            <Button
                              variant="secondary"
                              className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-[#003366] transition-all duration-300 text-base py-3" // Tăng kích thước nút
                            >
                              Xem chi tiết
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
          <div className="flex justify-center mt-6 space-x-2">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-[#003366] scale-125" : "bg-[#003366]/30 hover:bg-[#003366]/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}