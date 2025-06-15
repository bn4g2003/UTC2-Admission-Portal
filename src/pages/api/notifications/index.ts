import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';
import { DecodedToken } from '../../../../lib/auth'; // Import DecodedToken interface

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken: DecodedToken; // Chỉ định rõ kiểu DecodedToken
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
        // Lấy danh sách thông báo
        const notifications = await client.query(`
          SELECT
            n.id,
            n.title,
            n.content,
            n.created_at,
            n.priority,
            u.full_name as created_by_name,
            u.email as created_by_email
          FROM notifications n
          JOIN users u ON n.created_by = u.id
          ORDER BY 
            CASE 
              WHEN n.priority = 'urgent' THEN 1
              WHEN n.priority = 'high' THEN 2
              WHEN n.priority = 'medium' THEN 3
              WHEN n.priority = 'low' THEN 4
              ELSE 5
            END,
            n.created_at DESC
        `);

        return res.status(200).json(notifications.rows);

      case 'POST':
        // Chỉ TRUONGBAN mới được tạo thông báo
        if (decodedToken.role !== 'TRUONGBAN') {
          return res.status(403).json({ message: 'Chỉ Trưởng ban mới có quyền tạo thông báo.' });
        }

        const { title, content, priority } = req.body;

        // Validate required fields
        if (!title || !content || !priority) {
          return res.status(400).json({ message: 'Tiêu đề, nội dung và mức độ ưu tiên là bắt buộc.' });
        }

        // Validate priority value
        const validPriorities = ['urgent', 'high', 'medium', 'low'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({ message: 'Mức độ ưu tiên không hợp lệ.' });
        }

        // Lấy userId từ decodedToken.id (đã sửa từ decodedToken.userId)
        const userId = decodedToken.id;

        // Thêm kiểm tra nếu userId không tồn tại trong token (khó xảy ra nếu token hợp lệ)
        if (!userId) {
          console.error('Không tìm thấy ID người dùng trong token đã giải mã.');
          return res.status(401).json({ message: 'Thông tin người dùng không đầy đủ trong token.' });
        }

        // Tạo thông báo mới và trả về thông tin người tạo cùng một lúc
        const newNotification = await client.query(`
          INSERT INTO notifications (title, content, priority, created_by)
          VALUES ($1, $2, $3, $4)
          RETURNING id, title, content, priority, created_at, created_by
        `, [title, content, priority, userId]);

        // Tránh truy vấn thứ hai nếu bạn có thể lấy thông tin trực tiếp từ INSERT RETURNING
        // và sau đó JOIN với users nếu cần thêm full_name, email.
        // Hoặc bạn có thể sửa truy vấn INSERT để JOIN luôn, nhưng cách phổ biến là JOIN sau.
        // Cách tối ưu hơn là JOIN ngay sau khi INSERT để lấy full_name và email.
        const notificationWithUser = await client.query(`
            SELECT
              n.id,
              n.title,
              n.content,
              n.priority,
              n.created_at,
              u.full_name as created_by_name,
              u.email as created_by_email
            FROM notifications n
            JOIN users u ON n.created_by = u.id
            WHERE n.id = $1
        `, [newNotification.rows[0].id]);

        return res.status(201).json({
          message: 'Tạo thông báo thành công.',
          notification: notificationWithUser.rows[0]
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