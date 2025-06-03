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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID không hợp lệ.' });
  }

  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':
        // Fetch assignment details
        const assignment = await client.query(`
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
          WHERE a.id = $1
          ${decodedToken.role === 'GIAOVIEN' ? 'AND a.assigned_to = $2' : ''}
        `, decodedToken.role === 'GIAOVIEN' ? [id, decodedToken.userId] : [id]);

        if (assignment.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }

        return res.status(200).json(assignment.rows[0]);

      case 'PUT':
        const { status, assignment_details } = req.body;

        // Validate the assignment exists and check permissions
        const existingAssignment = await client.query(
          'SELECT * FROM assignments WHERE id = $1',
          [id]
        );

        if (existingAssignment.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }

        // GIAOVIEN chỉ có thể cập nhật trạng thái của công việc được phân công cho mình
        if (decodedToken.role === 'GIAOVIEN' && 
            existingAssignment.rows[0].assigned_to !== decodedToken.userId) {
          return res.status(403).json({ message: 'Không có quyền cập nhật công việc này.' });
        }

        // TRUONGBAN có thể cập nhật mọi thông tin
        // GIAOVIEN chỉ có thể cập nhật trạng thái
        let updateQuery = '';
        let updateValues = [];
        if (decodedToken.role === 'TRUONGBAN') {
          updateQuery = `
            UPDATE assignments 
            SET status = $1, 
                assignment_details = $2,
                completed_at = CASE 
                  WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP 
                  ELSE completed_at 
                END
            WHERE id = $3
            RETURNING *
          `;
          updateValues = [status, assignment_details, id];
        } else {
          updateQuery = `
            UPDATE assignments 
            SET status = $1,
                completed_at = CASE 
                  WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP 
                  ELSE completed_at 
                END
            WHERE id = $2 AND assigned_to = $3
            RETURNING *
          `;
          updateValues = [status, id, decodedToken.userId];
        }

        const updatedAssignment = await client.query(updateQuery, updateValues);

        return res.status(200).json({
          message: 'Cập nhật công việc thành công.',
          assignment: updatedAssignment.rows[0]
        });

      case 'DELETE':
        // Chỉ TRUONGBAN mới được xóa công việc
        if (decodedToken.role !== 'TRUONGBAN') {
          return res.status(403).json({ message: 'Chỉ Trưởng ban mới có quyền xóa công việc.' });
        }

        await client.query('DELETE FROM assignments WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Xóa công việc thành công.' });

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
