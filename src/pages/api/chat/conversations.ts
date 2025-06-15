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
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }

  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':        // Lấy danh sách cuộc trò chuyện 1-1 của user hiện tại
        const conversations = await client.query(`
          SELECT DISTINCT
            CASE 
              WHEN m.sender_id = $1 THEN m.receiver_id
              ELSE m.sender_id
            END as other_user_id,
            u.full_name as other_user_name,
            u.role as other_user_role,
            (
              SELECT m2.message_content
              FROM messages m2
              WHERE (m2.sender_id = $1 AND m2.receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
                 OR (m2.sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id = $1)
              ORDER BY m2.sent_at DESC
              LIMIT 1
            ) as last_message,
            (
              SELECT m2.sent_at
              FROM messages m2
              WHERE (m2.sender_id = $1 AND m2.receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
                 OR (m2.sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id = $1)
              ORDER BY m2.sent_at DESC
              LIMIT 1
            ) as last_message_time,            (
              SELECT COUNT(*)
              FROM messages m3
              WHERE m3.sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
                AND m3.receiver_id = $1
                AND m3.is_read = false
            ) as unread_count
          FROM messages m
          JOIN users u ON u.id = CASE 
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END
          WHERE (m.sender_id = $1 OR m.receiver_id = $1)
            AND m.receiver_id IS NOT NULL
          ORDER BY last_message_time DESC
        `, [decodedToken.id]);

        return res.status(200).json(conversations.rows);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Conversations API error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
