import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

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
      const { reportId } = req.query;
      
      if (!reportId) {
        return res.status(400).json({ message: 'ID báo cáo là bắt buộc.' });
      }

      // Check if the report exists and belongs to this teacher
      const reportQuery = await client.query(`
        SELECT 
          r.id,
          r.assignment_id,
          r.report_content,
          r.has_documents,
          r.submitted_at,
          r.status,
          r.reviewed_by,
          r.reviewed_at,
          r.review_comments,
          a.assignment_details,
          a.status as assignment_status,
          es.id as stage_id,
          es.stage_name,
          ep.id as plan_id,
          ep.plan_name
        FROM reports r
        JOIN assignments a ON r.assignment_id = a.id
        JOIN enrollment_stages es ON a.stage_id = es.id
        JOIN enrollment_plans ep ON es.plan_id = ep.id
        WHERE r.id = $1 AND r.reported_by = $2
      `, [reportId, decodedToken.id]);

      if (reportQuery.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Không tìm thấy báo cáo hoặc bạn không có quyền xem báo cáo này.' 
        });
      }      const report = reportQuery.rows[0];

      // Get documents for this report
      if (report.has_documents) {
        const documentsQuery = await client.query(`
          SELECT 
            d.id,
            d.document_name,
            d.file_path,
            d.file_type,
            d.file_size_kb,
            d.uploaded_at,
            u.full_name as uploaded_by_name
          FROM report_documents rd
          JOIN documents d ON rd.document_id = d.id
          JOIN users u ON d.uploaded_by = u.id
          WHERE rd.report_id = $1
        `, [reportId]);
        
        // Get signed URLs for each document
        const documentsWithUrls = await Promise.all(
          documentsQuery.rows.map(async (doc) => {
            try {
              const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.file_path, 60 * 60, {
                  download: doc.document_name // Use original file name for download
                });
              
              return {
                ...doc,
                downloadUrl: error ? null : data?.signedUrl
              };
            } catch (error) {
              console.error('Error creating signed URL for document:', doc.file_path, error);
              return {
                ...doc,
                downloadUrl: null
              };
            }
          })
        );
        
        report.documents = documentsWithUrls;
      }

      // If the report was reviewed, get reviewer info
      if (report.reviewed_by) {
        const reviewerQuery = await client.query(`
          SELECT full_name
          FROM users
          WHERE id = $1
        `, [report.reviewed_by]);
        
        if (reviewerQuery.rows.length > 0) {
          report.reviewer_name = reviewerQuery.rows[0].full_name;
        }
      }

      return res.status(200).json(report);
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
