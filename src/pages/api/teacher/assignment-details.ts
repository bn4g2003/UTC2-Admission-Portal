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
      const { assignmentId } = req.query;
      
      if (!assignmentId) {
        return res.status(400).json({ message: 'ID nhiệm vụ là bắt buộc.' });
      }
      
      console.log('Fetching details for assignment:', assignmentId);      // Lấy chi tiết về nhiệm vụ và kiểm tra xem giáo viên có được phân công không
      const assignmentQuery = await client.query(`
        SELECT 
          a.id,
          a.assignment_details,
          a.status,
          a.assigned_at,
          a.completed_at,
          es.id as stage_id,
          es.stage_name,
          es.stage_description,
          es.start_time,
          es.end_time,
          es.stage_order,
          ep.id as plan_id,
          ep.plan_name,
          EXTRACT(YEAR FROM ep.start_date) as year_start,
          ep.description as plan_description,
          ep.start_date as plan_start_date,
          ep.end_date as plan_end_date,          CASE 
            WHEN CURRENT_TIMESTAMP BETWEEN ep.start_date AND ep.end_date THEN 'hoạt_động'
            WHEN CURRENT_TIMESTAMP < ep.start_date THEN 'sắp_diễn_ra'
            ELSE 'hoàn_thành'
          END as plan_status,
          CASE 
            WHEN CURRENT_TIMESTAMP < es.start_time THEN 'sắp_diễn_ra'
            WHEN CURRENT_TIMESTAMP > es.end_time THEN 'hoàn_thành'
            ELSE 'đang_diễn_ra'
          END as stage_status
        FROM assignments a
        JOIN enrollment_stages es ON a.stage_id = es.id
        JOIN enrollment_plans ep ON es.plan_id = ep.id
        WHERE a.id = $1 AND a.assigned_to = $2
      `, [assignmentId, decodedToken.id]);

      if (assignmentQuery.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Không tìm thấy nhiệm vụ hoặc bạn không có quyền xem nhiệm vụ này.' 
        });
      }      // Lấy thông tin về người được phân công
      const assignedToQuery = await client.query(`
        SELECT id, full_name, email, phone_number as phone, address as department
        FROM users
        WHERE id = $1
      `, [decodedToken.id]);

      const assignment = {
        ...assignmentQuery.rows[0],
        assigned_to: assignedToQuery.rows[0]
      };      // Get all reports related to this assignment if they exist
      const reportsQuery = await client.query(`
        SELECT 
          r.id,
          r.report_content,
          r.has_documents,
          r.submitted_at,
          CASE
            WHEN r.status = 'submitted' THEN 'đã_gửi'
            WHEN r.status = 'reviewed' THEN 'đã_duyệt'
            WHEN r.status = 'rejected' THEN 'từ_chối'
            ELSE r.status
          END as report_status,
          r.reviewed_at,
          r.review_comments
        FROM reports r
        WHERE r.assignment_id = $1 AND r.reported_by = $2
        ORDER BY r.submitted_at DESC
      `, [assignmentId, decodedToken.id]);

      // Get documents for each report if they have documents
      if (reportsQuery.rows.length > 0) {
        for (const report of reportsQuery.rows) {
          if (report.has_documents) {
            const documentsQuery = await client.query(`
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
            `, [report.id]);
            
            // Generate signed URLs for each document
            if (documentsQuery.rows.length > 0) {
              const documentsWithUrls = [];
              
              for (const doc of documentsQuery.rows) {
                try {
                  console.log('Generating signed URL for document:', doc.file_path);
                  
                  const { data, error } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(doc.file_path, 60 * 60, {
                      download: doc.document_name
                    });
                  
                  documentsWithUrls.push({
                    ...doc,
                    downloadUrl: error ? null : data?.signedUrl
                  });
                } catch (error) {
                  console.error('Error creating signed URL for document:', error);
                  documentsWithUrls.push({
                    ...doc,
                    downloadUrl: null
                  });
                }
              }
              
              report.documents = documentsWithUrls;
            }
          }
        }
      }
      
      // Add reports to the assignment
      assignment.reports = reportsQuery.rows;

      console.log('Returning assignment details:', JSON.stringify({
        id: assignment.id,
        stage_name: assignment.stage_name,
        reports_count: assignment.reports?.length || 0
      }));

      return res.status(200).json(assignment);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Database error in assignment-details API:', error);
    return res.status(500).json({ 
      message: 'Lỗi server nội bộ khi lấy chi tiết nhiệm vụ.',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    client.release();
  }
}
