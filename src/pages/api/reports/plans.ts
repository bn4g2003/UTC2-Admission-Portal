import { NextApiRequest, NextApiResponse } from 'next';
import { decode } from 'jsonwebtoken';
import pool from '../../../../lib/db'; // Đảm bảo đường dẫn đúng
import { geminiModel } from '../../../../lib/gemini'; // Đảm bảo đường dẫn đúng

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = decode(token) as { role: string; id: string } | null;
    if (!decodedToken || !['TRUONGBAN', 'GIAOVIEN'].includes(decodedToken.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const client = await pool.connect();
    try {
      // Fetch plans data
      const plansQuery = `
        SELECT
          ep.id,
          ep.plan_name as title,
          ep.description,
          ep.start_date,
          ep.end_date,
          ep.created_at,
          u.full_name as created_by,
          COUNT(DISTINCT es.id) as total_stages,
          COUNT(DISTINCT a.id) as total_assignments,
          COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assignments
        FROM enrollment_plans ep
        LEFT JOIN users u ON ep.created_by = u.id
        LEFT JOIN enrollment_stages es ON es.plan_id = ep.id
        LEFT JOIN assignments a ON a.stage_id = es.id
        GROUP BY ep.id, ep.plan_name, ep.description, ep.start_date, ep.end_date, ep.created_at, u.full_name
        ORDER BY ep.created_at DESC
      `;
      const plansResult = await client.query(plansQuery);

      // Prepare data for the report
      const reportData = plansResult.rows.map(plan => {
        const totalAssignments = parseInt(plan.total_assignments);
        const completedAssignments = parseInt(plan.completed_assignments);
        const completionRate = totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(1) : '0.0';

        return {
          tenKeHoach: plan.title,
          moTa: plan.description,
          thoiGianBatDau: new Date(plan.start_date).toLocaleDateString('vi-VN'),
          thoiGianKetThuc: new Date(plan.end_date).toLocaleDateString('vi-VN'),
          // createdBy: plan.created_by, // Bỏ trường này nếu không muốn hiển thị trong báo cáo cuối cùng
          tongGiaiDoan: parseInt(plan.total_stages),
          tongNhiemVu: totalAssignments,
          nhiemVuHoanThanh: completedAssignments,
          tyLeHoanThanh: `${completionRate}%`
        };
      });

      // Thêm các chỉ số tổng quan
      const totalPlans = reportData.length;
      const totalCompletedAssignmentsOverall = reportData.reduce((sum, plan) => sum + plan.nhiemVuHoanThanh, 0);
      const totalAssignmentsOverall = reportData.reduce((sum, plan) => sum + plan.tongNhiemVu, 0);
      const overallCompletionRate = totalAssignmentsOverall > 0 ? ((totalCompletedAssignmentsOverall / totalAssignmentsOverall) * 100).toFixed(1) : '0.0';

      // Phân loại kế hoạch để báo cáo chi tiết hơn
      const keHoachDangTrienKhai = reportData.filter(plan => {
        // Chuyển đổi định dạng ngày tháng từ 'DD/MM/YYYY' sang 'YYYY-MM-DD' để Date object parse đúng
        const [day, month, year] = plan.thoiGianKetThuc.split('/');
        const endDate = new Date(`${year}-${month}-${day}`);
        return endDate >= new Date(); // Kế hoạch chưa kết thúc
      });
      const keHoachDaHoanThanh = reportData.filter(plan => {
        const [day, month, year] = plan.thoiGianKetThuc.split('/');
        const endDate = new Date(`${year}-${month}-${day}`);
        return endDate < new Date(); // Kế hoạch đã kết thúc
      });

      // Chuyển đổi dữ liệu bảng thành chuỗi Markdown để Gemini dễ xử lý
      const generateTableMarkdown = (plans: typeof reportData, type: 'current' | 'completed') => {
        let header = '';
        let rows = '';

        if (plans.length === 0) {
            return "Không có dữ liệu cho phần này.";
        }

        if (type === 'current') {
          header = '| STT | Tên kế hoạch | Thời gian | Giai đoạn | Nhiệm vụ | Tiến độ |\n|-----|--------------|------------|------------|----------|----------|';
          rows = plans.map((p, index) =>
            `| ${index + 1} | ${p.tenKeHoach} | ${p.thoiGianBatDau} - ${p.thoiGianKetThuc} | ${p.tongGiaiDoan} | ${p.nhiemVuHoanThanh}/${p.tongNhiemVu} | ${p.tyLeHoanThanh} |`
          ).join('\n');
        } else { // completed
          header = '| STT | Tên kế hoạch | Thời gian | Giai đoạn | Nhiệm vụ | Kết quả |\n|-----|--------------|------------|------------|----------|----------|';
          rows = plans.map((p, index) =>
            `| ${index + 1} | ${p.tenKeHoach} | ${p.thoiGianBatDau} - ${p.thoiGianKetThuc} | ${p.tongGiaiDoan} | ${p.nhiemVuHoanThanh}/${p.tongNhiemVu} | ${p.tyLeHoanThanh} |`
          ).join('\n');
        }
        return `${header}\n${rows}`;
      };

      const currentPlansTable = generateTableMarkdown(keHoachDangTrienKhai, 'current');
      const completedPlansTable = generateTableMarkdown(keHoachDaHoanThanh, 'completed');


      // Generate report content using Gemini
      const prompt = `Tạo một báo cáo chuyên nghiệp và chi tiết về các kế hoạch tuyển sinh của UTC2.
Hãy trình bày với phong cách chuyên nghiệp, dễ đọc và trực quan.

# 📋 BÁO CÁO KẾ HOẠCH TUYỂN SINH
*Thời gian: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*

---

## I. Tổng Quan Hiệu Suất

### 1. Chỉ số quan trọng
> **Tổng số kế hoạch**: ${totalPlans}
> **Tổng số nhiệm vụ**: ${totalAssignmentsOverall}
> **Tổng số nhiệm vụ đã hoàn thành**: ${totalCompletedAssignmentsOverall}
> **Tỷ lệ hoàn thành tổng thể**: ${overallCompletionRate}%
> **Kế hoạch đang thực hiện**: ${keHoachDangTrienKhai.length}

### 2. Phân tích tổng thể
Dựa trên các chỉ số trên, hãy nhận định chung về hiệu suất các kế hoạch tuyển sinh. Nêu bật các điểm mạnh và những lĩnh vực cần cải thiện.

---

## II. Chi Tiết Kế Hoạch

### 1. Kế hoạch đang triển khai
Dưới đây là danh sách chi tiết các kế hoạch đang được triển khai:
${currentPlansTable}
Hãy phân tích tiến độ của các kế hoạch này. Kế hoạch nào đang đi đúng hướng, kế hoạch nào có nguy cơ chậm trễ và tại sao?

### 2. Kế hoạch đã hoàn thành
Dưới đây là danh sách chi tiết các kế hoạch đã hoàn thành:
${completedPlansTable}
Hãy đánh giá kết quả của các kế hoạch này. Kế hoạch nào đạt mục tiêu xuất sắc, kế hoạch nào cần rút kinh nghiệm?

---

## III. Điểm Nổi Bật và Thách Thức

### 1. Thành công
Nêu bật các thành công đáng chú ý từ các kế hoạch đã hoàn thành, chỉ ra những yếu tố đã dẫn đến thành công đó và bài học kinh nghiệm có thể áp dụng.

### 2. Khó khăn
Phân tích các khó khăn, vướng mắc đã gặp phải trong quá trình triển khai kế hoạch. Nêu rõ nguyên nhân và tác động của chúng.

---

## IV. Đề Xuất & Cải Thiện

### 1. Khuyến nghị ngắn hạn
Đưa ra các khuyến nghị cụ thể, khả thi để điều chỉnh và tối ưu hóa các kế hoạch đang triển khai, hoặc giải quyết các vấn đề cấp bách.

### 2. Chiến lược dài hạn
Đề xuất các chiến lược phát triển dài hạn nhằm nâng cao hiệu quả tổng thể của công tác tuyển sinh, bao gồm cải tiến quy trình, đào tạo nhân sự.

---

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
      `;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const reportContent = response.text();

      return res.status(200).json({
        message: 'Report generated successfully',
        report: reportContent,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ message: 'Error generating report' });
  }
}