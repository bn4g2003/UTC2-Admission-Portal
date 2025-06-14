import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/auth';
import pool from '../../../../lib/db';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse){
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Only TRUONGBAN can view all reports
  if (req.user.role !== 'TRUONGBAN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }
  console.log('🔍 Fetching reports - Starting database query');
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    const result = await client.query(`
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
        a.assignment_details,
        (SELECT COUNT(*) FROM report_documents rd WHERE rd.report_id = r.id) as document_count
      FROM reports r
      LEFT JOIN users u ON r.reported_by = u.id
      LEFT JOIN assignments a ON r.assignment_id = a.id
      ORDER BY 
        CASE 
          WHEN r.status = 'submitted' THEN 0
          WHEN r.status = 'reviewed' THEN 1
          ELSE 2
        END,
        r.submitted_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {    console.error('❌ Database error:', error);
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

