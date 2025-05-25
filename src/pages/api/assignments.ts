import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { verifyAuthToken } from '../../../lib/auth';

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
    if (req.method === 'GET') {
      const { stageId } = req.query;
      
      if (!stageId || typeof stageId !== 'string') {
        return res.status(400).json({ message: 'ID giai đoạn là bắt buộc.' });
      }

      // Lấy danh sách phân công và thông tin giáo viên
      const result = await client.query(
        `SELECT 
          a.id, a.assignment_details, a.status,
          a.created_at, a.updated_at,
          u.id as teacher_id, u.email, u.full_name, u.phone_number
        FROM assignments a
        JOIN users u ON a.assigned_to = u.id
        WHERE a.stage_id = $1
        ORDER BY a.created_at DESC`,
        [stageId]
      );

      return res.status(200).json({ assignments: result.rows });

    } else if (req.method === 'POST') {
      const { stageId } = req.query;
      const { teacher_id, assignment_details } = req.body;

      if (!stageId || typeof stageId !== 'string') {
        return res.status(400).json({ message: 'ID giai đoạn là bắt buộc.' });
      }

      if (!teacher_id || !assignment_details) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra giáo viên có tồn tại và có vai trò GIAOVIEN không
      const teacherCheck = await client.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [teacher_id, 'GIAOVIEN']
      );

      if (teacherCheck.rowCount === 0) {
        return res.status(400).json({ message: 'Giáo viên không tồn tại hoặc không có quyền được phân công.' });
      }

      // Kiểm tra xem giáo viên đã được phân công cho giai đoạn này chưa
      const assignmentCheck = await client.query(
        'SELECT COUNT(*) as count FROM assignments WHERE stage_id = $1 AND assigned_to = $2',
        [stageId, teacher_id]
      );

      if (parseInt(assignmentCheck.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Giáo viên này đã được phân công cho giai đoạn này.' });
      }

      const result = await client.query(
        `INSERT INTO assignments (
          stage_id, assigned_to, assignment_details, status, created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, assignment_details, status, created_at`,
        [stageId, teacher_id, assignment_details, 'pending', decodedToken.id]
      );

      // Lấy thông tin giáo viên để trả về
      const teacherInfo = await client.query(
        'SELECT id as teacher_id, email, full_name, phone_number FROM users WHERE id = $1',
        [teacher_id]
      );

      return res.status(201).json({
        message: 'Phân công đã được tạo thành công.',
        assignment: {
          ...result.rows[0],
          ...teacherInfo.rows[0]
        }
      });

    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { assignment_details, status } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID phân công là bắt buộc.' });
      }

      if (!assignment_details || !status) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra trạng thái hợp lệ
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      }

      const result = await client.query(
        `UPDATE assignments 
        SET assignment_details = $1, status = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, assignment_details, status, created_at, updated_at`,
        [assignment_details, status, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy phân công để cập nhật.' });
      }

      // Lấy thông tin giáo viên để trả về
      const teacherInfo = await client.query(
        `SELECT u.id as teacher_id, u.email, u.full_name, u.phone_number 
        FROM assignments a
        JOIN users u ON a.assigned_to = u.id
        WHERE a.id = $1`,
        [id]
      );

      return res.status(200).json({
        message: 'Phân công đã được cập nhật thành công.',
        assignment: {
          ...result.rows[0],
          ...teacherInfo.rows[0]
        }
      });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID phân công là bắt buộc.' });
      }

      const result = await client.query(
        'DELETE FROM assignments WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy phân công để xóa.' });
      }

      return res.status(200).json({
        message: 'Phân công đã được xóa thành công.',
        id: result.rows[0].id
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Phương thức ${req.method} không được phép` });
    }
  } catch (error) {
    console.error('Lỗi khi quản lý phân công:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi quản lý phân công.' });
  } finally {
    client.release();
  }
} 