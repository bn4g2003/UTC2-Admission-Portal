import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Chỉ chấp nhận phương thức GET' });
  }

  try {
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
      // Lấy số lượng giáo viên
      const teachersResult = await client.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'GIAOVIEN'"
      );
      const totalTeachers = parseInt(teachersResult.rows[0].count);

      // Lấy số lượng kế hoạch đang diễn ra
      const plansResult = await client.query(
        "SELECT COUNT(*) as count FROM enrollment_plans WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE"
      );
      const activePlans = parseInt(plansResult.rows[0].count);

      // Lấy số lượng báo cáo chờ duyệt
      const reportsResult = await client.query(
        "SELECT COUNT(*) as count FROM reports WHERE status = 'submitted'"
      );
      const pendingReports = parseInt(reportsResult.rows[0].count);

      // Lấy số lượng thông báo mới trong 7 ngày gần nhất
      const notificationsResult = await client.query(
        "SELECT COUNT(*) as count FROM notifications WHERE created_at >= NOW() - INTERVAL '7 days'"
      );
      const latestNotifications = parseInt(notificationsResult.rows[0].count);

      return res.status(200).json({
        totalTeachers,
        activePlans,
        pendingReports,
        latestNotifications,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy thống kê.' });
  }
} 