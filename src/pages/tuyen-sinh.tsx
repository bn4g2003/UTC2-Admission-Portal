import { Header } from "@/components2/header";
import { Footer } from "@/components2/footer";

export default function TuyenSinhPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-8 px-2 md:px-0">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">THÔNG BÁO TUYỂN SINH ĐẠI HỌC CHÍNH QUY 2025</h1>
          <p className="mb-4 text-gray-700">
            Trường Đại học Giao thông vận tải thông báo hướng dẫn thí sinh nộp hồ sơ đăng ký xét tuyển đại học chính quy năm 2025 như sau:
          </p>
          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">1. Các phương thức xét tuyển</h2>
          <ul className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
            <li>PT1: Xét kết quả kỳ thi tốt nghiệp THPT 2025 &amp; xét tuyển thẳng học sinh đoạt giải quốc gia, quốc tế.</li>
            <li>PT2: Xét kết quả học tập cấp THPT (học bạ).</li>
            <li>PT3: Xét kết quả đánh giá năng lực của ĐHQGHN (Hà Nội) và ĐHQG-HCM (Phân hiệu TP.HCM).</li>
            <li>PT4: Xét kết quả đánh giá tư duy của ĐHBK Hà Nội (một số ngành tại Hà Nội).</li>
          </ul>
          <p className="mb-2 text-gray-700">Điểm trúng tuyển các phương thức PT2, PT3, PT4 được quy đổi tương đương điểm thi tốt nghiệp THPT (PT1). Thí sinh đăng ký nguyện vọng trên hệ thống của Bộ GD&ĐT, chọn mã trường (GHA cho Hà Nội, GSA cho Phân hiệu TP.HCM).</p>

          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">2. Về việc cung cấp dữ liệu</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Kết quả đánh giá tư duy, năng lực: các trường tổ chức sẽ cung cấp lên hệ thống chung của Bộ GD&ĐT, thí sinh không cần cung cấp.</li>
            <li>Kết quả học bạ: thí sinh tốt nghiệp 2025 không cần cung cấp, các năm trước cần cung cấp theo hướng dẫn.</li>
            <li>Chứng chỉ IELTS dùng để quy đổi điểm tiếng Anh: thí sinh cần cung cấp theo hướng dẫn.</li>
            <li>Tổ hợp V00, V01 ngành Kiến trúc: dùng kết quả thi Vẽ Mỹ thuật năm 2025, thời gian nhận kết quả sẽ thông báo sau.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">3. Hướng dẫn nộp hồ sơ</h2>
          <h3 className="font-semibold text-blue-800 mt-4 mb-1">3.1. Điều kiện xét tuyển học bạ</h3>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li>Tổng điểm trung bình cả năm của 3 môn trong tổ hợp xét tuyển của cả 3 năm THPT (Toán nhân đôi) + điểm ưu tiên (nếu có), không môn nào dưới 5.50.</li>
            <li>Thí sinh có thể dùng chứng chỉ IELTS từ 5.0 trở lên (còn hiệu lực đến 30/6/2025) để quy đổi điểm tiếng Anh.</li>
          </ul>
          <h3 className="font-semibold text-blue-800 mt-4 mb-1">3.2. Thời gian đăng ký xét tuyển</h3>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li><b>18/6/2025 - 18/7/2025:</b> Thí sinh tốt nghiệp trước 2025 đăng ký học bạ &amp; thí sinh dùng IELTS nộp hồ sơ online tại <a href="https://tuyensinh.utc2.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">tuyensinh.utc2.edu.vn</a> (Phân hiệu TP.HCM) hoặc <a href="https://tuyensinh.utc.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">tuyensinh.utc.edu.vn</a> (Hà Nội).</li>
            <li><b>16/7/2025 - 28/7/2025:</b> Thí sinh tốt nghiệp 2025 đăng ký nguyện vọng trên hệ thống của Bộ GD&ĐT.</li>
          </ul>
          <h3 className="font-semibold text-blue-800 mt-4 mb-1">3.3. Cách nộp hồ sơ online</h3>
          <ol className="list-decimal list-inside text-gray-700 mb-2 space-y-1">
            <li>Chuẩn bị file scan/chụp: học bạ, CCCD, giấy tờ ưu tiên (nếu có), chứng chỉ IELTS (nếu dùng).</li>
            <li>Đăng ký xét tuyển trực tuyến tại <a href="https://xettuyen.utc2.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">xettuyen.utc2.edu.vn</a> (Phân hiệu TP.HCM) hoặc <a href="https://xettuyen.utc.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">xettuyen.utc.edu.vn</a> (Hà Nội).</li>
            <li>Nộp lệ phí 50.000đ/hồ sơ (thực hiện ngay sau khi đăng ký online).</li>
          </ol>
          <p className="mb-2 text-gray-700">Thí sinh có thể bổ sung, đính chính thông tin trong giai đoạn 18/6/2025-18/7/2025. Sau thời gian này, hệ thống sẽ đóng.</p>
          <h3 className="font-semibold text-blue-800 mt-4 mb-1">3.4. Đăng ký nguyện vọng trên hệ thống Bộ GD&ĐT</h3>
          <p className="mb-2 text-gray-700">Từ 16/7/2025 đến 28/7/2025, thí sinh đã nộp hồ sơ online bắt buộc phải đăng ký nguyện vọng trên hệ thống của Bộ GD&ĐT để được xét tuyển.</p>

          <h2 className="text-xl font-bold text-blue-900 mt-6 mb-2">4. Thông tin liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Tuyển sinh &amp; đào tạo tại Hà Nội (GHA)</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Điện thoại: 02437606352</li>
                <li>Website: <a href="https://tuyensinh.utc.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">tuyensinh.utc.edu.vn</a></li>
                <li>Email: tuyensinh@utc.edu.vn</li>
                <li>Fanpage: <a href="https://www.facebook.com/dhgtvtcaugiay/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">facebook.com/dhgtvtcaugiay</a></li>
                <li>Chương trình liên kết quốc tế: <a href="http://tinyurl.com/TSLKQT2025" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Tư vấn</a> | <a href="https://ined.utc.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">ined.utc.edu.vn</a></li>
                <li>Hotline: 0915.96.55.41; 0353.380.835; 0944.50.58.68; 0815.55.96.69; 0983.14.02.38; 0988.98.25.26</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Tuyển sinh &amp; đào tạo tại Phân hiệu TP.HCM (GSA)</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Điện thoại: 02838962819</li>
                <li>Website: <a href="https://tuyensinh.utc2.edu.vn" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">tuyensinh.utc2.edu.vn</a></li>
                <li>Email: tuyensinh@utc.edu.vn</li>
                <li>Fanpage: <a href="https://www.facebook.com/utc2hcmc" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">facebook.com/utc2hcmc</a></li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Chi tiết xin vui lòng xem file đính kèm hoặc liên hệ các kênh trên để được hỗ trợ.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
