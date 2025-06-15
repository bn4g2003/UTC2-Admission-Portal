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
        // Lấy danh sách tất cả users để chat (trừ chính mình)
        const users = await client.query(`
          SELECT id, full_name, email, role
          FROM users 
          WHERE id != $1
          ORDER BY full_name ASC
        `, [decodedToken.id]);

        return res.status(200).json(users.rows);

      case 'POST':
        // Tạo phòng chat mới (nhóm)
        const { roomName, memberIds } = req.body;
        
        if (!roomName || !memberIds || !Array.isArray(memberIds)) {
          return res.status(400).json({ message: 'Tên phòng và danh sách thành viên là bắt buộc.' });
        }

        // Tạo chat room
        const newRoom = await client.query(`
          INSERT INTO chat_rooms (room_name)
          VALUES ($1)
          RETURNING id, room_name, created_at
        `, [roomName]);

        const roomId = newRoom.rows[0].id;

        // Thêm người tạo vào phòng
        await client.query(`
          INSERT INTO chat_room_members (room_id, user_id)
          VALUES ($1, $2)
        `, [roomId, decodedToken.id]);

        // Thêm các thành viên khác
        for (const memberId of memberIds) {
          await client.query(`
            INSERT INTO chat_room_members (room_id, user_id)
            VALUES ($1, $2)
          `, [roomId, memberId]);
        }

        return res.status(201).json({
          message: 'Tạo phòng chat thành công.',
          room: newRoom.rows[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
