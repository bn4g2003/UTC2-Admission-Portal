import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';
import { broadcastMessage, broadcastToRoom } from './events';

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
        const { receiverId, roomId } = req.query;
        
        if (roomId) {
          // Lấy tin nhắn trong phòng chat nhóm
          const messages = await client.query(`
            SELECT 
              m.id,
              m.message_content,
              m.sent_at,
              u.full_name as sender_name,
              u.id as sender_id,
              m.chat_room_id
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_room_id = $1
            ORDER BY m.sent_at ASC
          `, [roomId]);

          return res.status(200).json(messages.rows);
        } else if (receiverId) {
          // Lấy tin nhắn chat 1-1
          const messages = await client.query(`
            SELECT 
              m.id,
              m.message_content,
              m.sent_at,
              u.full_name as sender_name,
              u.id as sender_id,
              m.receiver_id
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2)
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.sent_at ASC
          `, [decodedToken.id, receiverId]);

          return res.status(200).json(messages.rows);
        } else {
          return res.status(400).json({ message: 'Cần chỉ định receiverId hoặc roomId.' });
        }

      case 'POST':
        const { message, receiverId: postReceiverId, roomId: postRoomId } = req.body;
        
        if (!message || message.trim() === '') {
          return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống.' });
        }

        let newMessage;
        if (postRoomId) {
          // Gửi tin nhắn vào phòng chat nhóm
          newMessage = await client.query(`
            INSERT INTO messages (sender_id, chat_room_id, message_content)
            VALUES ($1, $2, $3)
            RETURNING id, message_content, sent_at, chat_room_id
          `, [decodedToken.id, postRoomId, message.trim()]);
        } else if (postReceiverId) {
          // Gửi tin nhắn chat 1-1
          newMessage = await client.query(`
            INSERT INTO messages (sender_id, receiver_id, message_content)
            VALUES ($1, $2, $3)
            RETURNING id, message_content, sent_at, receiver_id
          `, [decodedToken.id, postReceiverId, message.trim()]);
        } else {
          return res.status(400).json({ message: 'Cần chỉ định receiverId hoặc roomId.' });
        }

        // Lấy thông tin người gửi
        const sender = await client.query(`
          SELECT full_name FROM users WHERE id = $1
        `, [decodedToken.id]);        const response = {
          ...newMessage.rows[0],
          sender_name: sender.rows[0].full_name,
          sender_id: decodedToken.id
        };

        // Broadcast tin nhắn mới qua SSE
        if (postRoomId) {
          // Broadcast đến tất cả thành viên phòng (trừ người gửi)
          broadcastToRoom(postRoomId, response, decodedToken.id);
        } else if (postReceiverId) {
          // Broadcast đến người nhận tin nhắn 1-1
          broadcastMessage([postReceiverId], response);
        }

        return res.status(201).json(response);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Messages API error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
