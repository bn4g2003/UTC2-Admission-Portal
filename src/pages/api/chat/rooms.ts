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
      case 'GET':
        // Lấy danh sách phòng chat của user hiện tại
        const rooms = await client.query(`
          SELECT DISTINCT 
            cr.id,
            cr.room_name,
            cr.created_at,
            (
              SELECT COUNT(*)
              FROM chat_room_members crm2
              WHERE crm2.room_id = cr.id
            ) as member_count,
            (
              SELECT m.message_content
              FROM messages m
              WHERE m.chat_room_id = cr.id
              ORDER BY m.sent_at DESC
              LIMIT 1
            ) as last_message,
            (
              SELECT m.sent_at
              FROM messages m
              WHERE m.chat_room_id = cr.id
              ORDER BY m.sent_at DESC
              LIMIT 1
            ) as last_message_time
          FROM chat_rooms cr
          JOIN chat_room_members crm ON cr.id = crm.room_id
          WHERE crm.user_id = $1
          ORDER BY last_message_time DESC NULLS LAST, cr.created_at DESC
        `, [decodedToken.id]);

        return res.status(200).json(rooms.rows);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Chat rooms API error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
