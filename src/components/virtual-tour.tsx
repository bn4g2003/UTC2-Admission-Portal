"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Maximize, Volume2, RotateCcw } from "lucide-react"

// Các điểm tham quan ảo của UTC2
const tourSpots = [
  // Thay thế các đường dẫn placeholder.svg bằng ảnh thực tế của trường nếu có
  // Hoặc dùng ảnh mockup tạm thời với tên file gợi nhớ.
  { id: 1, name: "Toàn cảnh Phân hiệu", image: "/images/campus_overview.jpg" }, 
  { id: 2, name: "Thư viện trung tâm", image: "/images/library.jpg" },
  { id: 3, name: "Phòng thí nghiệm hiện đại", image: "/images/labs.jpg" },
  { id: 4, name: "Khu Ký túc xá", image: "/images/dormitories.jpg" },
  { id: 5, name: "Khu vực thể thao", image: "/images/sport_area.jpg" }, // Thêm một điểm phổ biến
]

export function VirtualTour() {
  const [activeSpot, setActiveSpot] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false) // Giữ lại cho tính năng play/pause nếu có video

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#002147] mb-6 font-serif">Tham quan cơ sở vật chật </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Khám phá Phân hiệu Trường Đại học Giao thông vận tải tại TP. Hồ Chí Minh ngay từ bất cứ đâu với trải nghiệm tham quan ảo độc đáo của chúng tôi.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Điều hướng Tham quan */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#002147] mb-6">Khám phá khuôn viên trường</h3>
            {tourSpots.map((spot, index) => (
              <Card
                key={spot.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  activeSpot === index ? "ring-2 ring-[#FFD700] bg-[#FFD700]/10" : "hover:shadow-lg"
                }`}
                onClick={() => setActiveSpot(index)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={spot.image || "/placeholder.svg"} // Đảm bảo bạn có ảnh trong public/images/
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147]">{spot.name}</h4>
                    <p className="text-sm text-slate-600">Khám phá chi tiết</p> {/* Có thể đổi thành "Xem 360°" nếu có ảnh 360 thực tế */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Khung hiển thị Tour ảo */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl">
              <CardContent className="p-0 relative">
                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                  <img
                    src={tourSpots[activeSpot].image || "/placeholder.svg"}
                    alt={tourSpots[activeSpot].name}
                    className="w-full h-full object-cover"
                  />

                  {/* Lớp phủ điều khiển tour */}
                  {/* Các nút này giả định có video hoặc trải nghiệm 360° tương tác. Nếu chỉ là ảnh tĩnh thì có thể đơn giản hóa hoặc loại bỏ một số nút */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-[#002147]"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      {isPlaying ? "Tạm dừng Tour" : "Bắt đầu Tour"}
                    </Button>
                  </div>

                  {/* Thông tin Tour */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <h4 className="text-white font-semibold">{tourSpots[activeSpot].name}</h4>
                    <p className="text-white/80 text-sm">Trải nghiệm tương tác</p>
                  </div>

                  {/* Các nút điều khiển Tour (Giả định có video/360) */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <RotateCcw className="h-4 w-4" /> {/* Dùng cho xoay 360 nếu có */}
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mô tả Tour */}
                <div className="p-6 bg-gradient-to-r from-[#002147] to-[#003366]">
                  <h3 className="text-xl font-bold text-white mb-2">Khám phá {tourSpots[activeSpot].name}</h3>
                  <p className="text-slate-300">
                    Khám phá các cơ sở vật chất hiện đại và kiến trúc độc đáo của khuôn viên trường.
                    Sử dụng chuột hoặc cảm ứng để xem toàn cảnh 360 độ (nếu có).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}