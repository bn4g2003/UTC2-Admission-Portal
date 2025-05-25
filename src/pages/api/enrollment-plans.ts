import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { verifyAuthToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Xác thực token và vai trò cho TẤT CẢ các phương thức
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
      const newLocal = `
        SELECT 
          id, plan_name as title, description, start_date, end_date,
          CASE 
            WHEN start_date > CURRENT_DATE THEN 'upcoming'
            WHEN end_date < CURRENT_DATE THEN 'completed'
            ELSE 'active'
          END as status,
          created_at, updated_at
        FROM enrollment_plans 
        ORDER BY created_at DESC
      `;
      // Lấy danh sách kế hoạch
      const result = await client.query(newLocal);
      
      return res.status(200).json({ plans: result.rows });

    } else if (req.method === 'POST') {
      // Thêm kế hoạch mới
      const { title, description, start_date, end_date } = req.body;

      if (!title || !description || !start_date || !end_date) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }

      const result = await client.query(
        `INSERT INTO enrollment_plans (
          plan_name, description, start_date, end_date, created_by
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, plan_name as title, description, start_date, end_date, created_at`,
        [title, description, start_date, end_date, decodedToken.id]
      );

      return res.status(201).json({ 
        message: 'Kế hoạch đã được tạo thành công.',
        plan: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // Cập nhật kế hoạch
      const { id } = req.query;
      const { title, description, start_date, end_date } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID kế hoạch là bắt buộc.' });
      }

      if (!title || !description || !start_date || !end_date) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }

      const result = await client.query(
        `UPDATE enrollment_plans 
        SET plan_name = $1, description = $2, start_date = $3, end_date = $4, updated_at = NOW()
        WHERE id = $5 AND created_by = $6
        RETURNING id, plan_name as title, description, start_date, end_date, created_at, updated_at`,
        [title, description, start_date, end_date, id, decodedToken.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy kế hoạch để cập nhật hoặc không có quyền.' });
      }

      return res.status(200).json({
        message: 'Kế hoạch đã được cập nhật thành công.',
        plan: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // Xóa kế hoạch
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID kế hoạch là bắt buộc.' });
      }

      // Kiểm tra xem kế hoạch có đang được sử dụng không
      const checkUsage = await client.query(
        'SELECT COUNT(*) as count FROM enrollment_stages WHERE plan_id = $1',
        [id]
      );

      if (parseInt(checkUsage.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: 'Không thể xóa kế hoạch này vì đang có các giai đoạn liên quan.'
        });
      }

      const result = await client.query(
        'DELETE FROM enrollment_plans WHERE id = $1 AND created_by = $2 RETURNING id',
        [id, decodedToken.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy kế hoạch để xóa hoặc không có quyền.' });
      }

      return res.status(200).json({ 
        message: 'Kế hoạch đã được xóa thành công.',
        id: result.rows[0].id
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Phương thức ${req.method} không được phép` });
    }
  } catch (error) {
    console.error('Lỗi khi quản lý kế hoạch tuyển sinh:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi quản lý kế hoạch tuyển sinh.' });
  } finally {
    client.release();
  }
} 