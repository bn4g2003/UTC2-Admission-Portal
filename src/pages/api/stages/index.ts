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

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      // Lấy danh sách các giai đoạn đang diễn ra hoặc sắp diễn ra
      const stages = await client.query(`
        SELECT 
          es.id,
          es.stage_name,
          es.stage_description,
          es.start_time,
          es.end_time,
          ep.plan_name,
          ep.id as plan_id
        FROM enrollment_stages es
        JOIN enrollment_plans ep ON es.plan_id = ep.id
        WHERE ep.end_date >= CURRENT_DATE
        ORDER BY es.start_time ASC
      `);

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
