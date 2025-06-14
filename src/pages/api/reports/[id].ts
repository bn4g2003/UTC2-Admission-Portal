import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/auth';
import pool from '../../../../lib/db';
import { supabase } from '../../../../lib/supabase';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Only TRUONGBAN can view detailed reports
  if (req.user.role !== 'TRUONGBAN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }

  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid report ID' });
  }

  console.log('🔍 Fetching report details for ID:', id);
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Fetch the report with related data
    const reportResult = await client.query(`
      SELECT 
        r.id,
        r.assignment_id,
        r.reported_by,
        r.report_content,
        r.has_documents,
        r.submitted_at,
        r.status,
        r.reviewed_by,
        r.reviewed_at,
        r.review_comments,
        u.full_name as reporter_name,
        a.assignment_details
      FROM reports r
      LEFT JOIN users u ON r.reported_by = u.id
      LEFT JOIN assignments a ON r.assignment_id = a.id
      WHERE r.id = $1
    `, [id]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ message: 'Báo cáo không tồn tại' });
    }
    
    const report = reportResult.rows[0];

    // If the report has documents, fetch them
    if (report.has_documents) {
      const docsResult = await client.query(`
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
      `, [id]);
      
      // Generate signed URLs for each document
      if (docsResult.rows.length > 0) {
        const documentsWithUrls = await Promise.all(
          docsResult.rows.map(async (doc) => {
            try {
              // Check if file exists in storage
              const { data: checkData, error: checkError } = await supabase.storage
                .from('documents')
                .list('', {
                  search: doc.file_path
                });

              if (checkError || !checkData?.length) {
                console.error('File not found in storage:', doc.file_path);
                return {
                  ...doc,
                  downloadUrl: null,
                };
              }

              // Create signed URL for download
              const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.file_path, 60 * 60, {
                  download: doc.document_name
                });

              if (error) {
                console.error('Error creating signed URL:', error);
                return {
                  ...doc,
                  downloadUrl: null,
                };
              }

              return {
                ...doc,
                downloadUrl: data?.signedUrl || null,
              };
            } catch (error) {
              console.error('Error processing file:', doc.file_path, error);
              return {
                ...doc,
                downloadUrl: null,
              };
            }
          })
        );
        
        report.documents = documentsWithUrls;
      } else {
        report.documents = [];
      }
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
  } catch (error) {    
    console.error('❌ Database error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
    }
    return res.status(500).json({ 
      message: 'Lỗi server nội bộ.',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      console.log('🔄 Releasing database connection');
      client.release();
    }
  }
});
