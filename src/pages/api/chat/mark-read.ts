import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

  const { conversationId, roomId } = req.body;

  const client = await pool.connect();

  try {
    if (conversationId) {
      // Mark messages from conversationId to current user as read
      await client.query(`
        UPDATE messages 
        SET is_read = true 
        WHERE sender_id = $1 
          AND receiver_id = $2 
          AND is_read = false
      `, [conversationId, decodedToken.id]);
    } else if (roomId) {
      // Mark messages in room as read for current user
      // Note: For group chats, this is a simplified approach
      await client.query(`
        UPDATE messages 
        SET is_read = true 
        WHERE chat_room_id = $1 
          AND sender_id != $2 
          AND is_read = false
      `, [roomId, decodedToken.id]);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  } finally {
    client.release();
  }
}
