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
      // Lấy danh sách kế hoạch tuyển sinh
      const result = await client.query(`
        SELECT 
          ep.id,
          ep.plan_name as name,
          ep.description,
          ep.start_date,
          ep.end_date,
          ep.created_at,
          ep.updated_at,
          COUNT(es.id) as stages_count,
          CASE 
            WHEN CURRENT_DATE < ep.start_date THEN 'upcoming'
            WHEN CURRENT_DATE > ep.end_date THEN 'completed'
            ELSE 'ongoing'
          END as status
        FROM enrollment_plans ep
        LEFT JOIN enrollment_stages es ON ep.id = es.plan_id
        -- Chỉ lấy các kế hoạch mà giáo viên được phân công
        WHERE EXISTS (
          SELECT 1 FROM assignments a 
          JOIN enrollment_stages es2 ON a.stage_id = es2.id 
          WHERE es2.plan_id = ep.id AND a.assigned_to = $1
        )
        GROUP BY ep.id, ep.plan_name, ep.description, ep.start_date, ep.end_date,
                 ep.created_at, ep.updated_at
        ORDER BY 
          CASE 
            WHEN CURRENT_DATE BETWEEN ep.start_date AND ep.end_date THEN 1
            WHEN CURRENT_DATE < ep.start_date THEN 2
            ELSE 3
          END,
          ep.start_date ASC
      `, [decodedToken.id]);

      return res.status(200).json(result.rows);
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
