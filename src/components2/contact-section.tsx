import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export function ContactSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e3a8a] mb-2">Địa chỉ</h3>
                    <p className="text-gray-600">
                      450-451 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e3a8a] mb-2">Điện thoại</h3>
                    <p className="text-gray-600">
                      Tuyển sinh: 024.3869.3108
                      <br />
                      Đào tạo: 024.3869.3109
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e3a8a] mb-2">Email</h3>
                    <p className="text-gray-600">
                      tuyensinh@utc2.edu.vn
                      <br />
                      daotao@utc2.edu.vn
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e3a8a] mb-2">Giờ làm việc</h3>
                    <p className="text-gray-600">
                      Thứ 2 - Thứ 6: 7:30 - 17:00
                      <br />
                      Thứ 7: 7:30 - 11:30
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#1e3a8a] mb-6">Gửi tin nhắn cho chúng tôi</h3>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Họ và tên *
                      </Label>
                      <Input id="name" placeholder="Nhập họ và tên của bạn" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email *
                      </Label>
                      <Input id="email" type="email" placeholder="Nhập địa chỉ email" className="mt-2" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Số điện thoại
                      </Label>
                      <Input id="phone" placeholder="Nhập số điện thoại" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-medium">
                        Chủ đề
                      </Label>
                      <Input id="subject" placeholder="Chủ đề tin nhắn" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Nội dung *
                    </Label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                    />
                  </div>

                  <Button size="lg" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8">
                    <Send className="mr-2 h-5 w-5" />
                    Gửi tin nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <Card className="overflow-hidden shadow-xl">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Bản đồ vị trí trường học</p>
                <p className="text-sm">450-451 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
