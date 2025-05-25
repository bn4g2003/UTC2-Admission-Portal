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
      const { planId } = req.query;
      
      if (!planId || typeof planId !== 'string') {
        return res.status(400).json({ message: 'ID kế hoạch là bắt buộc.' });
      }

      // Lấy thông tin kế hoạch
      const planResult = await client.query(
        'SELECT id, plan_name, description FROM enrollment_plans WHERE id = $1',
        [planId]
      );

      if (planResult.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy kế hoạch.' });
      }

      // Lấy danh sách các giai đoạn
      const stagesResult = await client.query(
        `SELECT 
          id, stage_name, description, start_date, end_date, order_index,
          created_at, updated_at
        FROM enrollment_stages 
        WHERE plan_id = $1 
        ORDER BY order_index ASC`,
        [planId]
      );

      return res.status(200).json({
        plan: planResult.rows[0],
        stages: stagesResult.rows
      });

    } else if (req.method === 'POST') {
      const { planId } = req.query;
      const { stage_name, description, start_date, end_date, order_index } = req.body;

      if (!planId || typeof planId !== 'string') {
        return res.status(400).json({ message: 'ID kế hoạch là bắt buộc.' });
      }

      if (!stage_name || !description || !start_date || !end_date || !order_index) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra thứ tự đã tồn tại chưa
      const checkOrder = await client.query(
        'SELECT COUNT(*) as count FROM enrollment_stages WHERE plan_id = $1 AND order_index = $2',
        [planId, order_index]
      );

      if (parseInt(checkOrder.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Thứ tự này đã tồn tại trong kế hoạch.' });
      }

      // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }

      const result = await client.query(
        `INSERT INTO enrollment_stages (
          plan_id, stage_name, description, start_date, end_date, order_index, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, stage_name, description, start_date, end_date, order_index, created_at`,
        [planId, stage_name, description, start_date, end_date, order_index, decodedToken.id]
      );

      return res.status(201).json({
        message: 'Giai đoạn đã được tạo thành công.',
        stage: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { stage_name, description, start_date, end_date, order_index } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID giai đoạn là bắt buộc.' });
      }

      if (!stage_name || !description || !start_date || !end_date || !order_index) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Kiểm tra thứ tự đã tồn tại chưa (trừ giai đoạn hiện tại)
      const checkOrder = await client.query(
        'SELECT COUNT(*) as count FROM enrollment_stages WHERE id != $1 AND plan_id = (SELECT plan_id FROM enrollment_stages WHERE id = $1) AND order_index = $2',
        [id, order_index]
      );

      if (parseInt(checkOrder.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Thứ tự này đã tồn tại trong kế hoạch.' });
      }

      // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }

      const result = await client.query(
        `UPDATE enrollment_stages 
        SET stage_name = $1, description = $2, start_date = $3, end_date = $4, 
            order_index = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, stage_name, description, start_date, end_date, order_index, created_at, updated_at`,
        [stage_name, description, start_date, end_date, order_index, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giai đoạn để cập nhật.' });
      }

      return res.status(200).json({
        message: 'Giai đoạn đã được cập nhật thành công.',
        stage: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID giai đoạn là bắt buộc.' });
      }

      // Xóa các phân công liên quan trước
      await client.query('DELETE FROM assignments WHERE stage_id = $1', [id]);

      // Sau đó xóa giai đoạn
      const result = await client.query(
        'DELETE FROM enrollment_stages WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giai đoạn để xóa.' });
      }

      return res.status(200).json({
        message: 'Giai đoạn và các phân công liên quan đã được xóa thành công.',
        id: result.rows[0].id
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Phương thức ${req.method} không được phép` });
    }
  } catch (error) {
    console.error('Lỗi khi quản lý giai đoạn:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi quản lý giai đoạn.' });
  } finally {
    client.release();
  }
} 