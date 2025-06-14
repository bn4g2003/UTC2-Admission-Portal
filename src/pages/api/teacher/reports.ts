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
    switch (req.method) {
      case 'GET':
        const { assignmentId: assignmentIdQuery } = req.query;
        
        let query = `
          SELECT 
            r.id,
            r.report_content,
            r.has_documents,
            r.submitted_at,
            r.status as report_status,
            r.reviewed_at,
            r.review_comments,
            a.id as assignment_id,
            a.assignment_details,
            a.status as assignment_status,
            es.stage_name,
            ep.plan_name
          FROM reports r
          JOIN assignments a ON r.assignment_id = a.id
          JOIN enrollment_stages es ON a.stage_id = es.id
          JOIN enrollment_plans ep ON es.plan_id = ep.id
          WHERE r.reported_by = $1
        `;
        
        const params = [decodedToken.id];
        let paramIndex = 2;

        if (assignmentIdQuery) {
          query += ` AND a.id = $${paramIndex}`;
          params.push(assignmentIdQuery as string);
        }

        query += ` ORDER BY r.submitted_at DESC`;

        const reports = await client.query(query, params);
        
        // Nếu báo cáo có tài liệu đính kèm, lấy thông tin tài liệu
        for (const report of reports.rows) {
          if (report.has_documents) {
            const documentsQuery = `
              SELECT 
                d.id,
                d.document_name,
                d.file_path,
                d.file_type,
                d.file_size_kb,
                d.uploaded_at
              FROM report_documents rd
              JOIN documents d ON rd.document_id = d.id
              WHERE rd.report_id = $1
            `;
            const documentsResult = await client.query(documentsQuery, [report.id]);
            report.documents = documentsResult.rows;
          }
        }

        return res.status(200).json(reports.rows);

      case 'POST':
        // Tạo báo cáo mới
        const { assignmentId, reportContent, documentIds } = req.body;
        
        // Validate required fields
        if (!assignmentId || !reportContent) {
          return res.status(400).json({ message: 'ID nhiệm vụ và nội dung báo cáo là bắt buộc.' });
        }

        // Check if the assignment exists and belongs to this teacher
        const assignmentCheck = await client.query(
          'SELECT id FROM assignments WHERE id = $1 AND assigned_to = $2',
          [assignmentId, decodedToken.id]
        );

        if (assignmentCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ hoặc không có quyền báo cáo.' });
        }

        // Start a transaction for the report creation
        await client.query('BEGIN');

        try {
          // Create the report
          const hasDocuments = documentIds && documentIds.length > 0;
          const newReport = await client.query(
            `INSERT INTO reports (
              assignment_id, reported_by, report_content, has_documents, status
            ) VALUES ($1, $2, $3, $4, 'submitted')
            RETURNING id, report_content, has_documents, submitted_at, status`,
            [assignmentId, decodedToken.id, reportContent, hasDocuments]
          );

          // If document IDs were provided, link them to the report
          if (hasDocuments) {
            const reportId = newReport.rows[0].id;
            for (const documentId of documentIds) {
              // Check if document exists
              const docCheck = await client.query('SELECT id FROM documents WHERE id = $1', [documentId]);
              if (docCheck.rows.length > 0) {
                await client.query(
                  'INSERT INTO report_documents (report_id, document_id) VALUES ($1, $2)',
                  [reportId, documentId]
                );
              }
            }
          }

          // Update assignment status to completed if not already
          await client.query(
            `UPDATE assignments 
            SET status = 
              CASE WHEN status != 'completed' THEN 'completed' ELSE status END, 
              completed_at = 
              CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
            WHERE id = $1`,
            [assignmentId]
          );

          await client.query('COMMIT');

          return res.status(201).json({
            message: 'Báo cáo đã được gửi thành công.',
            report: newReport.rows[0]
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
