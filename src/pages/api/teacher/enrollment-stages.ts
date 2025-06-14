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
      const { planId } = req.query;
      
      if (!planId) {
        return res.status(400).json({ message: 'ID kế hoạch tuyển sinh là bắt buộc.' });
      }

      // Kiểm tra xem kế hoạch tuyển sinh có tồn tại không
      const planCheck = await client.query(
        'SELECT id FROM enrollment_plans WHERE id = $1',
        [planId]
      );

      if (planCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy kế hoạch tuyển sinh.' });
      }

      // Lấy danh sách các giai đoạn của kế hoạch tuyển sinh
      const stages = await client.query(`
        SELECT 
          es.id,
          es.stage_name,
          es.stage_description,
          es.start_time,
          es.end_time,
          es.stage_order,
          es.created_at,
          es.updated_at,
          CASE 
            WHEN CURRENT_TIMESTAMP < es.start_time THEN 'upcoming'
            WHEN CURRENT_TIMESTAMP > es.end_time THEN 'completed'
            ELSE 'ongoing'
          END as status,
          EXISTS (
            SELECT 1 FROM assignments a 
            WHERE a.stage_id = es.id AND a.assigned_to = $1
          ) as is_assigned
        FROM enrollment_stages es
        WHERE es.plan_id = $2
        ORDER BY es.stage_order ASC
      `, [decodedToken.id, planId]);

      return res.status(200).json(stages.rows);
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
