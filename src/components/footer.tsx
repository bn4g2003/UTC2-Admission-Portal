import Link from "next/link"
import { Facebook, Youtube, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react" // Đổi Twitter thành Youtube nếu UTC2 có kênh Youtube

export function Footer() {
  const currentYear = new Date().getFullYear(); // Lấy năm hiện tại

  return (
    <footer className="bg-[#002147] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Thông tin Phân hiệu */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-serif mb-4">Phân hiệu Trường ĐH Giao thông vận tải tại TP.HCM</h3>
              <p className="text-slate-300 leading-relaxed">
                Nơi đào tạo nguồn nhân lực chất lượng cao, đóng góp vào sự phát triển bền vững của ngành Giao thông vận tải Việt Nam.
              </p>
            </div>
            {/* Các liên kết mạng xã hội */}
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/utc2.edu.vn" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-[#FFD700] transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              {/* Thay thế liên kết Twitter bằng Youtube nếu có */}
              <Link href="https://www.youtube.com/@utc2channel" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-[#FFD700] transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/utc2.official/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-[#FFD700] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              {/* LinkedIn của trường nếu có */}
              <Link href="https://www.linkedin.com/school/utc2-university/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-[#FFD700] transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#FFD700]">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/tuyen-sinh" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Tuyển sinh
                </Link>
              </li>
              <li>
                <Link href="/chuong-trinh-dao-tao" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Chương trình đào tạo
                </Link>
              </li>
              <li>
                <Link href="/nghien-cuu-khoa-hoc" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Nghiên cứu khoa học
                </Link>
              </li>
              <li>
                <Link href="/cuoc-song-sinh-vien" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Cuộc sống sinh viên
                </Link>
              </li>
              <li>
                <Link href="/cuu-sinh-vien" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Cựu sinh viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Tài nguyên */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#FFD700]">Tài nguyên</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/thu-vien" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Thư viện
                </Link>
              </li>
              <li>
                <Link href="/huong-nghiep-viec-lam" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Dịch vụ việc làm
                </Link>
              </li>
              <li>
                <Link href="/hoc-phi-hoc-bong" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Học phí & Học bổng
                </Link>
              </li>
              <li>
                <Link href="/an-ninh-hoc-duong" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  An ninh học đường
                </Link>
              </li>
              <li>
                <Link href="/dich-vu-cntt" className="text-slate-300 hover:text-[#FFD700] transition-colors">
                  Dịch vụ CNTT
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#FFD700]">Liên hệ</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#FFD700] mt-1" /> {/* Thêm mt-1 để căn chỉnh icon */}
                <span className="text-slate-300">
                  450-451 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#FFD700]" />
                <span className="text-slate-300">(028) 3896 6797</span> {/* Số điện thoại chính thức của UTC2 */}
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#FFD700]" />
                <span className="text-slate-300">tuyensinh@utc2.edu.vn</span> {/* Email tuyển sinh hoặc email chung */}
              </div>
            </div>
          </div>
        </div>

        {/* Thanh cuối trang */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-300 text-sm">© {currentYear} Phân hiệu Trường Đại học Giao thông vận tải tại TP. Hồ Chí Minh. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/chinh-sach-bao-mat" className="text-slate-300 hover:text-[#FFD700] text-sm transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="text-slate-300 hover:text-[#FFD700] text-sm transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/tro-giup" className="text-slate-300 hover:text-[#FFD700] text-sm transition-colors">
              Trợ giúp
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}