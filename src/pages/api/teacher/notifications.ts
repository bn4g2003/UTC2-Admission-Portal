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
    switch (req.method) {
      case 'GET':
        // Lấy danh sách thông báo cho giáo viên
        const { limit, offset = 0, unreadOnly } = req.query;
        let limitClause = '';
        
        if (limit) {
          limitClause = ` LIMIT ${parseInt(limit as string, 10)}`;
        }

        let query = `
          SELECT 
            n.id,
            n.title,
            n.content,
            n.created_at,
            u.full_name as created_by_name,
            COALESCE(un.is_read, FALSE) as is_read,
            un.read_at
          FROM notifications n
          JOIN users u ON n.created_by = u.id
          LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = $1
        `;

        const params = [decodedToken.id];

        if (unreadOnly === 'true') {
          query += ` WHERE un.is_read IS NULL OR un.is_read = FALSE`;
        }

        query += ` ORDER BY n.created_at DESC`;
        query += limitClause;
        query += ` OFFSET ${offset}`;

        const notifications = await client.query(query, params);
        return res.status(200).json(notifications.rows);

      case 'PUT':
        // Đánh dấu thông báo đã đọc
        const { notificationId } = req.body;
        
        if (!notificationId) {
          return res.status(400).json({ message: 'ID thông báo là bắt buộc.' });
        }

        // Kiểm tra xem thông báo có tồn tại không
        const notificationCheck = await client.query(
          'SELECT id FROM notifications WHERE id = $1',
          [notificationId]
        );

        if (notificationCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        // Upsert (insert hoặc update) bản ghi trong user_notifications
        const markAsRead = await client.query(`
          INSERT INTO user_notifications (user_id, notification_id, is_read, read_at)
          VALUES ($1, $2, TRUE, NOW())
          ON CONFLICT (user_id, notification_id)
          DO UPDATE SET is_read = TRUE, read_at = NOW()
          RETURNING notification_id, is_read, read_at
        `, [decodedToken.id, notificationId]);

        return res.status(200).json({
          message: 'Đã đánh dấu thông báo là đã đọc.',
          notification: markAsRead.rows[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
