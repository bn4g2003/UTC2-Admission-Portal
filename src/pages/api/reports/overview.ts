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
      // Fetch overall statistics
      const statsQuery = `
        WITH user_stats AS (
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN role = 'GIAOVIEN' THEN 1 END) as total_teachers,
            COUNT(CASE WHEN role = 'TRUONGBAN' THEN 1 END) as total_admins
          FROM users
        ),
        plan_stats AS (
          SELECT 
            COUNT(*) as total_plans,
            COUNT(CASE WHEN end_date >= CURRENT_DATE THEN 1 END) as active_plans,
            COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as completed_plans
          FROM enrollment_plans
        ),
        assignment_stats AS (
          SELECT 
            COUNT(*) as total_assignments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assignments,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_assignments
          FROM assignments
        ),
        report_stats AS (
          SELECT 
            COUNT(*) as total_reports,
            COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_reports,
            COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_reports,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_reports
          FROM reports
        ),
        document_stats AS (
          SELECT 
            COUNT(*) as total_documents,
            SUM(file_size_kb) / 1024.0 as total_size_mb,
            json_agg(json_build_object(
              'name', document_name,
              'url', file_path,
              'type', file_type,
              'size', file_size_kb
            )) as document_list
          FROM documents
        )
        SELECT 
          user_stats.*,
          plan_stats.*,
          assignment_stats.*,
          report_stats.*,
          document_stats.*
        FROM user_stats, plan_stats, assignment_stats, report_stats, document_stats
      `
      const statsResult = await client.query(statsQuery)
      const stats = statsResult.rows[0]

      // Prepare data for the report
      const reportData = {
        users: {
          total: stats.total_users,
          teachers: stats.total_teachers,
          admins: stats.total_admins
        },
        plans: {
          total: stats.total_plans,
          active: stats.active_plans,
          completed: stats.completed_plans,
          completionRate: `${((stats.completed_plans / stats.total_plans) * 100 || 0).toFixed(1)}%`
        },
        assignments: {
          total: stats.total_assignments,
          completed: stats.completed_assignments,
          inProgress: stats.in_progress_assignments,
          pending: stats.pending_assignments,
          completionRate: `${((stats.completed_assignments / stats.total_assignments) * 100 || 0).toFixed(1)}%`
        },
        reports: {
          total: stats.total_reports,
          reviewed: stats.reviewed_reports,
          pending: stats.pending_reports,
          rejected: stats.rejected_reports,
          approvalRate: `${((stats.reviewed_reports / stats.total_reports) * 100 || 0).toFixed(1)}%`
        },
        documents: {
          total: stats.total_documents,
          totalSizeMB: stats.total_size_mb ? stats.total_size_mb.toFixed(2) : '0',
          list: stats.document_list || []
        }
      }

      // Generate report content using Gemini
      const prompt = `Tạo một báo cáo tổng quan chuyên nghiệp về hoạt động của hệ thống tuyển sinh UTC2. Hãy trình bày báo cáo với phong cách chuyên nghiệp, dễ đọc và trực quan.

#  BÁO CÁO TỔNG QUAN HỆ THỐNG TUYỂN SINH
*Thời gian: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*

## I. Phân Tích Nhân Sự
### 1. Thống kê người dùng
- Tổng số người dùng hệ thống
- Phân bố theo vai trò (Trưởng ban/Giáo viên)
- Tỷ lệ hoạt động và tương tác

### 2. Đánh giá hiệu suất
- So sánh hiệu suất làm việc giữa các nhóm
- Xu hướng tăng trưởng người dùng
- Các điểm nổi bật và cần cải thiện

## II. Kế Hoạch Tuyển Sinh
### 1. Tổng quan kế hoạch
- Số lượng kế hoạch (đang hoạt động/đã hoàn thành)
- Phân tích tỷ lệ hoàn thành
- Đánh giá hiệu quả triển khai

### 2. Phân tích xu hướng
- So sánh với kỳ trước
- Dự báo xu hướng tới
- Các điểm cần lưu ý

##  III. Quản Lý Nhiệm Vụ
### 1. Thống kê chi tiết
- Phân bố trạng thái nhiệm vụ
- Tỷ lệ hoàn thành theo thời gian
- Các vấn đề phát sinh

### 2. Đánh giá hiệu suất
- Thời gian trung bình hoàn thành
- Các nhiệm vụ trọng điểm
- Đề xuất cải thiện

## IV. Báo Cáo & Phê Duyệt
### 1. Thống kê báo cáo
- Tổng quan tình trạng báo cáo
- Tỷ lệ phê duyệt/từ chối
- Thời gian xử lý trung bình

### 2. Phân tích chất lượng
- Đánh giá chất lượng báo cáo
- Các vấn đề thường gặp
- Hướng dẫn cải thiện

## V. Quản Lý Tài Liệu
### 1. Thống kê tổng quan
- Số lượng và dung lượng tài liệu
- Phân loại theo định dạng
- Xu hướng sử dụng

### 2. Danh mục tài liệu
| STT | Tên tài liệu | Loại | Dung lượng | Truy cập |
|-----|--------------|------|-------------|-----------|
[Tự động điền từ dữ liệu]

## VI. Đề Xuất & Kế Hoạch
### 1. Điểm mạnh
- Các thành tựu đạt được
- Điểm nổi bật trong vận hành
- Hiệu quả đã cải thiện

### 2. Điểm cần cải thiện
- Các vấn đề tồn đọng
- Rủi ro tiềm ẩn
- Giải pháp đề xuất

### 3. Kế hoạch phát triển
- Mục tiêu ngắn hạn
- Chiến lược dài hạn
- Các bước triển khai

Dữ liệu thống kê chi tiết:
${JSON.stringify(reportData, null, 2)}

**Yêu cầu trình bày báo cáo:**
1.  Sử dụng Markdown để định dạng với các tiêu đề (heading #, ##, ###) rõ ràng.
2.  Đảm bảo các bảng được căn chỉnh đẹp mắt.
3.  Đây là báo cáo hành chính vì vậy hãy làm theo những gì bạn biết về báo cáo hành chính
4.  Sử dụng blockquote (>) cho các chỉ số quan trọng.
5.  Sử dụng in đậm (**) cho các số liệu và nhận định quan trọng.
6.  Thêm đường kẻ ngang (---) giữa các phần chính.
7.  Sử dụng bullet points (-) cho danh sách phân tích.
8.  Kết thúc bằng tổng kết và khuyến nghị cụ thể, nhấn mạnh tính khả thi và tầm quan trọng.
9.  Tập trung vào nội dung không nói những câu mở đầu hay kết thúc như "Đây là báo cáo tuyển sinh của UTC2" hay "Đây là báo cáo tuyển sinh của UTC2"
.`

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