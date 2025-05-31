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

  if (decodedToken.role !== 'TRUONGBAN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }

  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':
        const result = await client.query(`
          SELECT 
            ep.id,
            ep.plan_name as name,
            ep.description,
            ep.start_date,
            ep.end_date,
            ep.created_by,
            ep.created_at,
            ep.updated_at,
            u.email as created_by_email,
            COUNT(es.id) as stages_count,
            CASE 
              WHEN CURRENT_DATE < ep.start_date THEN 'upcoming'
              WHEN CURRENT_DATE > ep.end_date THEN 'completed'
              ELSE 'ongoing'
            END as status
          FROM enrollment_plans ep
          LEFT JOIN users u ON ep.created_by = u.id
          LEFT JOIN enrollment_stages es ON ep.id = es.plan_id
          GROUP BY ep.id, ep.plan_name, ep.description, ep.start_date, ep.end_date,
                   ep.created_by, ep.created_at, ep.updated_at, u.email
          ORDER BY ep.created_at DESC
        `);
        return res.status(200).json(result.rows);

      case 'POST':
        const { name, description, start_date, end_date } = req.body;

        // Validate required fields
        if (!name || !description || !start_date || !end_date) {
          return res.status(400).json({ message: 'Tất cả các trường là bắt buộc.' });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (endDate <= startDate) {
          return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu.' });
        }

        // Insert new plan
        const newPlan = await client.query(`
          INSERT INTO enrollment_plans (
            plan_name, description, start_date, end_date, created_by
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id, plan_name as name, description, start_date, end_date, created_by, created_at
        `, [name, description, start_date, end_date, decodedToken.id]);

        return res.status(201).json({
          message: 'Kế hoạch tuyển sinh đã được tạo thành công.',
          plan: newPlan.rows[0]
        });

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