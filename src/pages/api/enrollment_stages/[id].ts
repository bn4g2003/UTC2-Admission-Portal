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
    return res.status(403).json({ message: 'Chỉ Trưởng ban mới có quyền quản lý các giai đoạn.' });
  }

  const { id } = req.query;
  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':
        const stageResult = await client.query(`
          SELECT 
            id, plan_id, stage_name, stage_description, 
            start_time, end_time, stage_order,
            created_at, updated_at
          FROM enrollment_stages 
          WHERE id = $1
        `, [id]);

        if (stageResult.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy giai đoạn.' });
        }

        return res.status(200).json(stageResult.rows[0]);

      case 'PUT':
        const { stage_name, stage_description, start_time, end_time, stage_order } = req.body;

        // Validate required fields
        if (!stage_name || !start_time || !end_time || !stage_order) {
          return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
        }

        // Validate dates
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
        
        if (endTime <= startTime) {
          return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
        }

        // Get existing stage to check plan_id
        const existingStage = await client.query(`
          SELECT plan_id FROM enrollment_stages WHERE id = $1
        `, [id]);

        if (existingStage.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy giai đoạn để cập nhật.' });
        }

        const planId = existingStage.rows[0].plan_id;

        // Check if enrollment plan exists and validate dates
        const planCheck = await client.query(`
          SELECT start_date, end_date FROM enrollment_plans WHERE id = $1
        `, [planId]);

        if (planCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy kế hoạch tuyển sinh.' });
        }

        const planStartDate = new Date(planCheck.rows[0].start_date);
        const planEndDate = new Date(planCheck.rows[0].end_date);

        if (startTime < planStartDate || endTime > planEndDate) {
          return res.status(400).json({
            message: 'Thời gian của giai đoạn phải nằm trong khoảng thời gian của kế hoạch.'
          });
        }

        // Check for stage order conflicts
        const orderCheck = await client.query(`
          SELECT id FROM enrollment_stages
          WHERE plan_id = $1 AND stage_order = $2 AND id != $3
        `, [planId, stage_order, id]);

        if (orderCheck.rows.length > 0) {
          return res.status(400).json({
            message: 'Đã tồn tại giai đoạn với thứ tự này trong kế hoạch.'
          });
        }

        // Update stage
        const updatedStage = await client.query(`
          UPDATE enrollment_stages
          SET stage_name = $1, stage_description = $2,
              start_time = $3, end_time = $4,
              stage_order = $5, updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING *
        `, [stage_name, stage_description, start_time, end_time, stage_order, id]);

        return res.status(200).json({
          message: 'Cập nhật giai đoạn thành công.',
          stage: updatedStage.rows[0]
        });

      case 'DELETE':
        // Check if stage exists
        const stageCheck = await client.query(`
          SELECT id FROM enrollment_stages WHERE id = $1
        `, [id]);

        if (stageCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy giai đoạn để xóa.' });
        }

        // Delete stage
        await client.query('DELETE FROM enrollment_stages WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Xóa giai đoạn thành công.' });

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
