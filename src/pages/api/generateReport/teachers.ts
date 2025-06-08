import { NextApiRequest, NextApiResponse } from 'next'
import { decode } from 'jsonwebtoken'
import pool from '../../../../lib/db'
import { geminiModel } from '../../../../lib/gemini'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decodedToken = decode(token) as { role: string; id: string } | null
    if (!decodedToken || !['TRUONGBAN', 'GIAOVIEN'].includes(decodedToken.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const client = await pool.connect()
    try {
      // Fetch teachers data with their assignments and reports
      const teachersQuery = `
        SELECT 
          u.id,
          u.full_name,
          u.email,
          COUNT(DISTINCT a.id) as total_assignments,
          COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assignments,
          COUNT(DISTINCT r.id) as total_reports,
          COUNT(DISTINCT CASE WHEN r.status = 'reviewed' THEN r.id END) as approved_reports
        FROM users u
        LEFT JOIN assignments a ON a.assigned_to = u.id
        LEFT JOIN reports r ON r.reported_by = u.id
        WHERE u.role = 'GIAOVIEN'
        GROUP BY u.id, u.full_name, u.email
        ORDER BY u.full_name
      `
      const teachersResult = await client.query(teachersQuery)

      // Prepare data for the report
      const reportData = teachersResult.rows.map(teacher => ({
        name: teacher.full_name,
        email: teacher.email,
        totalAssignments: teacher.total_assignments,
        completedAssignments: teacher.completed_assignments,
        completionRate: `${((teacher.completed_assignments / teacher.total_assignments) * 100 || 0).toFixed(1)}%`,
        totalReports: teacher.total_reports,
        approvedReports: teacher.approved_reports,
        reportApprovalRate: `${((teacher.approved_reports / teacher.total_reports) * 100 || 0).toFixed(1)}%`
      }))

      // Generate report content using Gemini
      const prompt = `Tạo một báo cáo chuyên nghiệp và chi tiết về hoạt động của giáo viên trong hệ thống tuyển sinh UTC2. Hãy trình bày với phong cách chuyên nghiệp, dễ đọc và trực quan.

# BÁO CÁO HOẠT ĐỘNG GIÁO VIÊN
*Thời gian: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*

##  I. Tổng Quan Hiệu Suất
### 1. Chỉ số quan trọng
>  **Tổng số giáo viên**: [Số liệu]
>  **Tỷ lệ hoàn thành nhiệm vụ**: [Tỷ lệ]
>  **Tỷ lệ báo cáo được duyệt**: [Tỷ lệ]

### 2. Phân tích xu hướng
- So sánh với kỳ trước
- Xu hướng hiệu suất
- Các điểm nổi bật

---

## II. Hiệu Suất Chi Tiết
### 1. Bảng xếp hạng hiệu suất
| STT | Giáo viên | Nhiệm vụ | Hoàn thành | Tỷ lệ | Báo cáo | Được duyệt |
|-----|-----------|----------|------------|--------|---------|------------|
[Tự động điền từ dữ liệu]

### 2. Phân tích theo nhóm
- Nhóm hiệu suất cao (>80%)
- Nhóm hiệu suất trung bình (50-80%)
- Nhóm cần hỗ trợ (<50%)

---

## III. Đánh Giá Chất Lượng
### 1. Chất lượng nhiệm vụ
- Tỷ lệ hoàn thành đúng hạn
- Chất lượng công việc
- Phản hồi từ trưởng ban

### 2. Chất lượng báo cáo
- Tỷ lệ báo cáo được duyệt
- Các vấn đề thường gặp
- Hướng dẫn cải thiện

---

## IV. Thành Tích Nổi Bật
### 1. Giáo viên xuất sắc
- Top 3 hiệu suất cao nhất
- Các thành tích đặc biệt
- Yếu tố thành công

### 2. Cải thiện đáng kể
- Những tiến bộ vượt bậc
- Các yếu tố tác động
- Bài học kinh nghiệm

---

## V. Đề Xuất & Phát Triển
### 1. Hỗ trợ cần thiết
- Nhóm cần hỗ trợ
- Loại hình hỗ trợ
- Kế hoạch triển khai

### 2. Chiến lược phát triển
- Đào tạo và phát triển
- Cải thiện quy trình
- Chính sách khuyến khích

### 3. Mục tiêu tới
- Chỉ tiêu cần đạt
- Kế hoạch hành động
- Thời gian thực hiện

Dữ liệu chi tiết:
${JSON.stringify(reportData, null, 2)}

Yêu cầu trình bày:
1. Sử dụng Markdown để định dạng với các heading (#, ##, ###)
2. Tạo bảng có viền và căn chỉnh để hiển thị số liệu
3. Sử dụng emoji phù hợp cho các tiêu đề
4. Tạo blockquote (>) cho các chỉ số quan trọng
5. Sử dụng in đậm (**) và in nghiêng (*) cho số liệu quan trọng
6. Thêm đường kẻ ngang (---) giữa các phần chính
7. Sử dụng bullet points (-) cho danh sách
8. Thêm biểu đồ ASCII đơn giản nếu cần
9. Định dạng email và tên người dùng phù hợp
10. Kết thúc bằng tổng kết và khuyến nghị cụ thể

Lưu ý:
- Phân tích sâu các số liệu và xu hướng
- Đưa ra nhận xét khách quan, công bằng
- Đề xuất các giải pháp khả thi
- Tôn trọng quyền riêng tư của giáo viên
- Sử dụng ngôn ngữ tích cực, khuyến khích
- Nhấn mạnh các điểm cần cải thiện một cách xây dựng`

      const result = await geminiModel.generateContent(prompt)
      const response = await result.response
      const reportContent = response.text()

      return res.status(200).json({
        message: 'Report generated successfully',
        report: reportContent,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return res.status(500).json({ message: 'Error generating report' })
  }
} 