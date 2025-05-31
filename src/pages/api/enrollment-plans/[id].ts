import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID kế hoạch không hợp lệ.' });
  }

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
        // Get plan details with stages
        const plan = await client.query(`
          SELECT 
            ep.id,
            ep.name,
            ep.description,
            ep.start_date,
            ep.end_date,
            ep.created_by,
            ep.created_at,
            ep.updated_at,
            u.email as created_by_email,
            CASE 
              WHEN CURRENT_DATE < ep.start_date THEN 'upcoming'
              WHEN CURRENT_DATE > ep.end_date THEN 'completed'
              ELSE 'ongoing'
            END as status
          FROM enrollment_plans ep
          LEFT JOIN users u ON ep.created_by = u.id
          WHERE ep.id = $1
        `, [id]);

        if (plan.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy kế hoạch.' });
        }

        // Get stages
        const stages = await client.query(`
          SELECT id, name, description, start_date, end_date, order_number
          FROM enrollment_stages
          WHERE plan_id = $1
          ORDER BY order_number ASC
        `, [id]);

        return res.status(200).json({
          ...plan.rows[0],
          stages: stages.rows
        });

      case 'PUT':
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

        // Update plan
        const updatedPlan = await client.query(`
          UPDATE enrollment_plans
          SET name = $1, description = $2, start_date = $3, end_date = $4, updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING *
        `, [name, description, start_date, end_date, id]);

        if (updatedPlan.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy kế hoạch để cập nhật.' });
        }

        return res.status(200).json({
          message: 'Cập nhật kế hoạch thành công.',
          plan: updatedPlan.rows[0]
        });

      case 'DELETE':
        // Check if plan exists
        const existingPlan = await client.query(
          'SELECT id FROM enrollment_plans WHERE id = $1',
          [id]
        );

        if (existingPlan.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy kế hoạch để xóa.' });
        }

        // Begin transaction
        await client.query('BEGIN');

        try {
          // Delete all stages first (cascade will handle related assignments)
          await client.query('DELETE FROM enrollment_stages WHERE plan_id = $1', [id]);
          
          // Then delete the plan
          await client.query('DELETE FROM enrollment_plans WHERE id = $1', [id]);
          
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }

        return res.status(200).json({
          message: 'Xóa kế hoạch thành công.'
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
} 