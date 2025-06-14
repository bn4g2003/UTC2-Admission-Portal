import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken;
  try {
    decodedToken = verifyAuthToken(token);
  } catch (authError) {
    console.error('Lỗi xác thực token:', authError);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }

  if (decodedToken.role !== 'GIAOVIEN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Giáo viên được phép.' });
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { stageId } = req.query;
      
      if (!stageId) {
        return res.status(400).json({ message: 'ID giai đoạn là bắt buộc.' });
      }

      // Lấy chi tiết về giai đoạn và kiểm tra xem giáo viên có được phân công không
      const stageQuery = await client.query(`
        SELECT 
          es.id,
          es.stage_name,
          es.stage_description,
          es.start_time,
          es.end_time,
          es.stage_order,
          ep.id as plan_id,
          ep.plan_name,
          ep.start_date as plan_start_date,
          ep.end_date as plan_end_date,
          a.id as assignment_id,
          a.assignment_details,
          a.status as assignment_status,
          a.assigned_at,
          a.completed_at,
          CASE 
            WHEN CURRENT_TIMESTAMP < es.start_time THEN 'upcoming'
            WHEN CURRENT_TIMESTAMP > es.end_time THEN 'completed'
            ELSE 'ongoing'
          END as status
        FROM enrollment_stages es
        JOIN enrollment_plans ep ON es.plan_id = ep.id
        LEFT JOIN assignments a ON es.id = a.stage_id AND a.assigned_to = $1
        WHERE es.id = $2
      `, [decodedToken.id, stageId]);

      if (stageQuery.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giai đoạn.' });
      }

      // Check if this teacher is assigned to this stage
      if (!stageQuery.rows[0].assignment_id) {
        return res.status(403).json({ 
          message: 'Bạn không được phân công cho giai đoạn này.' 
        });
      }

      // Get all reports related to this assignment if they exist
      const reportsQuery = await client.query(`
        SELECT 
          r.id,
          r.report_content,
          r.has_documents,
          r.submitted_at,
          r.status as report_status,
          r.reviewed_at,
          r.review_comments
        FROM reports r
        WHERE r.assignment_id = $1
        ORDER BY r.submitted_at DESC
      `, [stageQuery.rows[0].assignment_id]);

      // Get documents for each report if they have documents
      for (const report of reportsQuery.rows) {
        if (report.has_documents) {
          const documentsQuery = await client.query(`
            SELECT 
              d.id,
              d.document_name,
              d.file_path,
              d.file_type
            FROM report_documents rd
            JOIN documents d ON rd.document_id = d.id
            WHERE rd.report_id = $1
          `, [report.id]);
          
          report.documents = documentsQuery.rows;
        }
      }

      // Return detailed information
      const stageDetails = {
        ...stageQuery.rows[0],
        reports: reportsQuery.rows
      };

      return res.status(200).json(stageDetails);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
