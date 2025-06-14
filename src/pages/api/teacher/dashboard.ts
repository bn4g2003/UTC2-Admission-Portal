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

  try {
    if (req.method === 'GET') {
      // Lấy thống kê tổng quan cho dashboard của giáo viên
      
      // 1. Số nhiệm vụ theo trạng thái
      const assignmentStatsQuery = await client.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM assignments
        WHERE assigned_to = $1
        GROUP BY status
      `, [decodedToken.id]);

      // 2. Số báo cáo theo trạng thái
      const reportStatsQuery = await client.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM reports
        WHERE reported_by = $1
        GROUP BY status
      `, [decodedToken.id]);

      // 3. Nhiệm vụ gần đây (5 nhiệm vụ gần nhất)
      const recentAssignmentsQuery = await client.query(`
        SELECT 
          a.id,
          a.assignment_details,
          a.status,
          a.assigned_at,
          es.stage_name,
          ep.plan_name
        FROM assignments a
        JOIN enrollment_stages es ON a.stage_id = es.id
        JOIN enrollment_plans ep ON es.plan_id = ep.id
        WHERE a.assigned_to = $1
        ORDER BY 
          CASE 
            WHEN a.status = 'pending' THEN 1
            WHEN a.status = 'in_progress' THEN 2
            ELSE 3
          END,
          a.assigned_at DESC
        LIMIT 5
      `, [decodedToken.id]);

      // 4. Thông báo chưa đọc
      const unreadNotificationsQuery = await client.query(`
        SELECT COUNT(*) as count
        FROM notifications n
        LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = $1
        WHERE un.is_read IS NULL OR un.is_read = FALSE
      `, [decodedToken.id]);

      // 5. Các kế hoạch tuyển sinh đang diễn ra
      const ongoingPlansQuery = await client.query(`
        SELECT 
          COUNT(DISTINCT ep.id) as count
        FROM enrollment_plans ep
        JOIN enrollment_stages es ON ep.id = es.plan_id
        JOIN assignments a ON es.id = a.stage_id
        WHERE 
          a.assigned_to = $1 AND
          CURRENT_DATE BETWEEN ep.start_date AND ep.end_date
      `, [decodedToken.id]);      // Hàm chuyển đổi trạng thái sang tiếng Việt
      const translateStatus = (status: string): string => {
        switch(status.toLowerCase()) {
          case 'submitted': return 'đã_gửi';
          case 'reviewed': return 'đã_duyệt';
          case 'rejected': return 'từ_chối';
          case 'completed': return 'hoàn_thành';
          case 'pending': return 'pending'; // Giữ nguyên vì frontend đã xử lý
          case 'in_progress': return 'in_progress'; // Giữ nguyên vì frontend đã xử lý
          case 'cancelled': return 'cancelled'; // Giữ nguyên vì frontend đã xử lý
          default: return status;
        }
      };
      
      const dashboard = {
        assignments: {
          total: assignmentStatsQuery.rows.reduce((acc, row) => acc + parseInt(row.count), 0),
          byStatus: assignmentStatsQuery.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count); // Giữ nguyên key tiếng Anh vì frontend đã có hàm getStatusDisplay
            return acc;
          }, {} as Record<string, number>)
        },
        reports: {
          total: reportStatsQuery.rows.reduce((acc, row) => acc + parseInt(row.count), 0),
          byStatus: reportStatsQuery.rows.reduce((acc, row) => {
            acc[translateStatus(row.status)] = parseInt(row.count);
            return acc;
          }, {} as Record<string, number>)
        },
        recentAssignments: recentAssignmentsQuery.rows.map(assignment => ({
          ...assignment,
          // Giữ nguyên trạng thái vì frontend đã có hàm getStatusDisplay
        })),
        unreadNotifications: parseInt(unreadNotificationsQuery.rows[0]?.count || '0'),
        ongoingPlans: parseInt(ongoingPlansQuery.rows[0]?.count || '0')
      };

      return res.status(200).json(dashboard);
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
