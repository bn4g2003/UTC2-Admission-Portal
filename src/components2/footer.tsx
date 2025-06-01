import Link from "next/link"
import { Facebook, Youtube, Zap, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1e3a8a] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#1e3a8a] font-bold text-lg">UTC2</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</h3>
                <p className="text-blue-200 text-sm">PHÂN HIỆU TẠI TP. HỒ CHÍ MINH</p>
              </div>
            </div>

            <p className="text-blue-100 mb-6 leading-relaxed">
              Trường Đại học Giao thông Vận tải - Phân hiệu tại TP.HCM là cơ sở đào tạo uy tín, chuyên đào tạo nguồn
              nhân lực chất lượng cao trong lĩnh vực giao thông vận tải và các ngành liên quan.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-400" />
                <span className="text-blue-100">
                  450-451 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400" />
                <span className="text-blue-100">024.3869.3108</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400" />
                <span className="text-blue-100">tuyensinh@utc2.edu.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-orange-400">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/gioi-thieu" className="text-blue-100 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/tuyen-sinh" className="text-blue-100 hover:text-white transition-colors">
                  Tuyển sinh
                </Link>
              </li>
              <li>
                <Link href="/dao-tao" className="text-blue-100 hover:text-white transition-colors">
                  Đào tạo
                </Link>
              </li>
              <li>
                <Link href="/sinh-vien" className="text-blue-100 hover:text-white transition-colors">
                  Sinh viên
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="text-blue-100 hover:text-white transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-blue-100 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-orange-400">Chương trình đào tạo</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/nganh/kt-giao-thong" className="text-blue-100 hover:text-white transition-colors">
                  Kỹ thuật Giao thông
                </Link>
              </li>
              <li>
                <Link href="/nganh/kt-oto" className="text-blue-100 hover:text-white transition-colors">
                  Kỹ thuật Ô tô
                </Link>
              </li>
              <li>
                <Link href="/nganh/logistics" className="text-blue-100 hover:text-white transition-colors">
                  Logistics
                </Link>
              </li>
              <li>
                <Link href="/nganh/kt-van-tai" className="text-blue-100 hover:text-white transition-colors">
                  Kinh tế Vận tải
                </Link>
              </li>
              <li>
                <Link href="/nganh/cntt" className="text-blue-100 hover:text-white transition-colors">
                  Công nghệ Thông tin
                </Link>
              </li>
              <li>
                <Link href="/nganh/kt-xay-dung" className="text-blue-100 hover:text-white transition-colors">
                  Kỹ thuật Xây dựng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-blue-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Zap className="h-6 w-6" />
              </Link>
            </div>

            <div className="text-center md:text-right">
              <p className="text-blue-200 text-sm">
                © {new Date().getFullYear()} Trường Đại học Giao thông Vận tải - Phân hiệu tại TP.HCM. Tất cả quyền được
                bảo lưu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
