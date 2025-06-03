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
    switch (req.method) {
      case 'GET':
        // Nếu là GIANGVIEN, chỉ xem được công việc của mình
        // Nếu là TRUONGBAN, xem được tất cả công việc
        const query = decodedToken.role === 'GIAOVIEN' 
          ? `
            SELECT 
              a.id,
              a.stage_id,
              a.assigned_to,
              a.assignment_details,
              a.status,
              a.assigned_at,
              a.completed_at,
              u.full_name as assigned_to_name,
              es.stage_name,
              ep.plan_name
            FROM assignments a
            JOIN users u ON a.assigned_to = u.id
            JOIN enrollment_stages es ON a.stage_id = es.id
            JOIN enrollment_plans ep ON es.plan_id = ep.id
            WHERE a.assigned_to = $1
            ORDER BY a.assigned_at DESC
          `
          : `
            SELECT 
              a.id,
              a.stage_id,
              a.assigned_to,
              a.assignment_details,
              a.status,
              a.assigned_at,
              a.completed_at,
              u.full_name as assigned_to_name,
              es.stage_name,
              ep.plan_name
            FROM assignments a
            JOIN users u ON a.assigned_to = u.id
            JOIN enrollment_stages es ON a.stage_id = es.id
            JOIN enrollment_plans ep ON es.plan_id = ep.id
            ORDER BY a.assigned_at DESC
          `;

        const assignments = await client.query(
          query,
          decodedToken.role === 'GIAOVIEN' ? [decodedToken.userId] : []
        );

        return res.status(200).json(assignments.rows);

      case 'POST':
        // Chỉ TRUONGBAN mới được phân công
        if (decodedToken.role !== 'TRUONGBAN') {
          return res.status(403).json({ message: 'Chỉ Trưởng ban mới có quyền phân công công việc.' });
        }

        const { stage_id, assigned_to, assignment_details } = req.body;

        // Validate required fields
        if (!stage_id || !assigned_to || !assignment_details) {
          return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
        }

        // Kiểm tra người được phân công có phải là GIANGVIEN không
        const userCheck = await client.query(
          'SELECT role FROM users WHERE id = $1',
          [assigned_to]
        );

        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'GIAOVIEN') {
          return res.status(400).json({ message: 'Người được phân công phải là Giảng viên.' });
        }

        // Kiểm tra giai đoạn có tồn tại không
        const stageCheck = await client.query(
          'SELECT id FROM enrollment_stages WHERE id = $1',
          [stage_id]
        );

        if (stageCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy giai đoạn.' });
        }

        // Tạo assignment mới
        const newAssignment = await client.query(`
          INSERT INTO assignments (stage_id, assigned_to, assignment_details)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [stage_id, assigned_to, assignment_details]);

        return res.status(201).json({
          message: 'Phân công công việc thành công.',
          assignment: newAssignment.rows[0]
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
