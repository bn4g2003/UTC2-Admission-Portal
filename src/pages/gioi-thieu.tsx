import { Header } from "@/components2/header";
import { Footer } from "@/components2/footer";

export default function GioiThieuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-8 px-2 md:px-0">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">GIỚI THIỆU</h1>
          <p className="mb-4">
            <b>Phân hiệu Trường Đại học Giao thông Vận tải tại Thành phố Hồ Chí Minh</b> (tiếng Anh: University of Transport and Communications, Campus in Ho Chi Minh City – UTC2) là cơ sở đào tạo phía Nam của Trường Đại học Giao thông Vận tải có trụ sở tại Hà Nội, một trường đại học công lập hàng đầu chuyên đào tạo nhóm ngành kỹ thuật và kinh tế trong giao thông vận tải tại Việt Nam.
          </p>
          <p className="mb-4">
            Sau ngày miền Nam hoàn toàn giải phóng, để đáp ứng nhu cầu mới cho sự nghiệp xây dựng đất nước nói chung và phát triển giao thông vận tải khu vực phía Nam nói riêng, ngày 27 tháng 4 năm 1990, Bộ trưởng Bộ Giáo dục và Đào tạo ký Quyết định số 139/TCCB thành lập Cơ sở II (nay là Phân hiệu) tại Thành phố Hồ Chí Minh của Trường Đại học Giao thông Vận tải trực thuộc Bộ Giáo dục và Đào tạo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="font-semibold text-blue-800 mb-1">Địa chỉ</h2>
              <p>Số 450–451 Lê Văn Việt, phường Tăng Nhơn Phú A, thành phố Thủ Đức, TP.HCM, Việt Nam</p>
              <h2 className="font-semibold text-blue-800 mt-4 mb-1">Website</h2>
              <a href="https://www.utc2.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.utc2.edu.vn</a>
              <h2 className="font-semibold text-blue-800 mt-4 mb-1">Thông tin khác</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li><b>Thành lập:</b> 1990</li>
                <li><b>Loại:</b> Đại học kỹ thuật hệ công lập</li>
                <li><b>Hiệu trưởng:</b> GS.TS. Nguyễn Ngọc Long</li>
                <li><b>Khuôn viên:</b> 16ha</li>
                <li><b>Viết tắt:</b> UTC2</li>
                <li><b>Thành viên của:</b> Bộ Giáo dục và Đào tạo</li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-blue-800 mb-1">Ban Giám hiệu</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Hiệu trưởng: GS.TS. Nguyễn Ngọc Long</li>
                <li>Phó hiệu trưởng: PGS.TS. Nguyễn Thanh Chương</li>
                <li>PGS.TS. Lê Hoài Đức</li>
                <li>PGS.TS. Nguyễn Văn Hùng</li>
              </ul>
              <h2 className="font-semibold text-blue-800 mt-4 mb-1">Quy mô đào tạo</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Trên 6000 sinh viên và học viên các hệ</li>
                <li>12 ngành bậc sau đại học</li>
                <li>Đội ngũ: 186 cán bộ, 135 giảng viên (5 PGS, 31 TS, 93 ThS)</li>
              </ul>
            </div>
          </div>
          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">Các ngành đào tạo</h2>
          <p className="mb-2">UTC2 đào tạo đa dạng các ngành thuộc lĩnh vực kỹ thuật, kinh tế, quản lý, công nghệ thông tin, logistics, kiến trúc, xây dựng, ô tô, điện, điện tử, điều khiển tự động hóa, quản trị kinh doanh, tài chính, kế toán, du lịch, vận tải, v.v.</p>
          <ul className="list-disc list-inside text-gray-700 mb-4" style={{columnCount: 2}}>
            <li>Quản trị kinh doanh</li>
            <li>Kinh doanh quốc tế</li>
            <li>Tài chính - Ngân hàng</li>
            <li>Kế toán (Kế toán tổng hợp)</li>
            <li>Công nghệ thông tin</li>
            <li>Logistics và Quản lý chuỗi cung ứng</li>
            <li>Kỹ thuật cơ điện tử</li>
            <li>Kỹ thuật cơ khí động lực</li>
            <li>Kỹ thuật ô tô</li>
            <li>Kỹ thuật điện</li>
            <li>Kỹ thuật điện tử - viễn thông</li>
            <li>Kỹ thuật điều khiển và tự động hóa</li>
            <li>Kiến trúc</li>
            <li>Quản lý đô thị và công trình</li>
            <li>Kỹ thuật xây dựng</li>
            <li>Kỹ thuật xây dựng công trình giao thông</li>
            <li>Kinh tế xây dựng</li>
            <li>Quản lý xây dựng</li>
            <li>Quản trị dịch vụ du lịch và lữ hành</li>
            <li>Khai thác vận tải</li>
            <li>Kinh tế vận tải</li>
            <li>Kỹ thuật máy tính</li>
            <li>Chương trình vi mạch - bán dẫn</li>
            <li>Chương trình đường sắt tốc độ cao</li>
          </ul>
          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">Cơ sở vật chất & Đời sống sinh viên</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Ký túc xá hiện đại, sức chứa gần 2000 sinh viên, khuôn viên rộng 12ha</li>
            <li>Phòng tập GYM, sân bóng, sân chơi thể thao, dịch vụ đa dạng</li>
            <li>Thư viện, phòng thí nghiệm, trang thiết bị thực hành hiện đại</li>
            <li>Không gian tự học lý tưởng, giảng đường liên tục được cải tạo, xây mới</li>
          </ul>
          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">Thành tích & Định hướng phát triển</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Đạt nhiều danh hiệu cao quý: Huân chương Lao động hạng Nhất, Nhì, Ba</li>
            <li>Tập thể Lao động xuất sắc nhiều năm liền</li>
            <li>Đội ngũ giảng viên trẻ, nhiều người được đào tạo ở nước ngoài</li>
            <li>Định hướng trở thành trung tâm đào tạo nguồn nhân lực chất lượng cao hàng đầu phía Nam</li>
          </ul>
          <p className="mt-6 text-gray-700">
            Trải qua gần 35 năm xây dựng và phát triển (27/4/1990 - 27/4/2025), Phân hiệu Trường Đại học Giao thông Vận tải tại TP. Hồ Chí Minh đã góp phần tích cực vào sự nghiệp giáo dục của nước nhà. Với sự chỉ đạo của Ban Giám hiệu Nhà trường, Đảng ủy và Ban Giám đốc, toàn thể cán bộ, giảng viên, nhân viên cũng như sinh viên, học viên tại Phân hiệu luôn tin tưởng vào thương hiệu và vị thế của Nhà trường, cùng nhau xây dựng Trường trở thành một trong những trung tâm đào tạo nguồn nhân lực chất lượng cao hàng đầu tại Khu vực phía Nam và của nước nhà.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
