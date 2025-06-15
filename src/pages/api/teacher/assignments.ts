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

  try {    switch (req.method) {
      case 'GET':
        const { planId, status, assignmentId: queryAssignmentId } = req.query;
        
        // If assignmentId is provided, redirect to assignment-details endpoint
        if (queryAssignmentId) {
          console.log('Assignment ID provided, redirecting to assignment-details endpoint');
          return res.redirect(`/api/teacher/assignment-details?assignmentId=${queryAssignmentId}`);
        }
        
        console.log('Fetching assignments for teacher:', decodedToken.id);
        console.log('Query parameters:', req.query);
        
        let query = `
          SELECT 
            a.id,
            a.assignment_details,
            a.status,
            a.assigned_at,
            a.completed_at,
            es.id as stage_id,
            es.stage_name,
            es.stage_description,
            es.start_time,
            es.end_time,
            ep.id as plan_id,
            ep.plan_name
          FROM assignments a
          JOIN enrollment_stages es ON a.stage_id = es.id
          JOIN enrollment_plans ep ON es.plan_id = ep.id
          WHERE a.assigned_to = $1
        `;
        
        const queryParams = [decodedToken.id];
        let paramIndex = 2;

        if (planId) {
          query += ` AND ep.id = $${paramIndex}`;
          queryParams.push(planId as string);
          paramIndex++;
        }

        if (status) {
          query += ` AND a.status = $${paramIndex}`;
          queryParams.push(status as string);
          paramIndex++;
        }

        query += ` ORDER BY es.start_time ASC, es.stage_order ASC`;
        
        const assignments = await client.query(query, queryParams);
        return res.status(200).json(assignments.rows);

      case 'PUT':
        const { assignmentId, newStatus } = req.body;

        // Validate required fields
        if (!assignmentId || !newStatus) {
          return res.status(400).json({ message: 'ID nhiệm vụ và trạng thái mới là bắt buộc.' });
        }

        // Validate status value
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
          return res.status(400).json({ 
            message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: pending, in_progress, completed, cancelled.' 
          });
        }

        // Check if the assignment exists and get stage timing information
        const assignmentCheck = await client.query(
          `SELECT 
            a.id,
            es.start_time,
            es.end_time,
            CURRENT_TIMESTAMP > es.start_time as can_start,
            CURRENT_TIMESTAMP > es.end_time as is_overdue
          FROM assignments a
          JOIN enrollment_stages es ON a.stage_id = es.id
          WHERE a.id = $1 AND a.assigned_to = $2`,
          [assignmentId, decodedToken.id]
        );

        if (assignmentCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ hoặc không có quyền cập nhật.' });
        }

        const assignment = assignmentCheck.rows[0];

        // Check if the assignment can be started
        if (newStatus === 'in_progress' && !assignment.can_start) {
          return res.status(400).json({ 
            message: 'Không thể bắt đầu nhiệm vụ trước thời gian bắt đầu của giai đoạn.' 
          });
        }

        // Check if the assignment can be completed
        if (newStatus === 'completed' && !assignment.can_start) {
          return res.status(400).json({ 
            message: 'Không thể hoàn thành nhiệm vụ trước thời gian bắt đầu của giai đoạn.' 
          });
        }
        
        // Update the assignment status
        const completedAt = newStatus === 'completed' ? 'NOW()' : null;
        const updateResult = await client.query(
          `UPDATE assignments 
           SET status = $1, completed_at = ${completedAt || 'completed_at'}
           WHERE id = $2 AND assigned_to = $3
           RETURNING id, status, completed_at`,
          [newStatus, assignmentId, decodedToken.id]
        );

        return res.status(200).json({
          message: 'Cập nhật trạng thái nhiệm vụ thành công.',
          assignment: updateResult.rows[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }  } catch (error) {
    console.error('Database error in assignments API:', error);
    return res.status(500).json({ 
      message: 'Lỗi server nội bộ khi truy vấn danh sách nhiệm vụ.',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    client.release();
  }
}
