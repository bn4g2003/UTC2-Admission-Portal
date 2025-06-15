import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';

// Lưu trữ các kết nối SSE active
const connections = new Map<string, NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  const userId = decodedToken.id;

  // Thiết lập SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Lưu kết nối
  connections.set(userId, res);

  // Gửi ping định kỳ để duy trì kết nối
  const pingInterval = setInterval(() => {
    if (connections.has(userId)) {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
    }
  }, 30000); // 30 giây

  // Gửi thông báo kết nối thành công
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Xử lý khi client đóng kết nối
  req.on('close', () => {
    clearInterval(pingInterval);
    connections.delete(userId);
    console.log(`SSE connection closed for user: ${userId}`);
  });

  req.on('error', () => {
    clearInterval(pingInterval);
    connections.delete(userId);
  });
}

// Hàm helper để broadcast tin nhắn đến các user cụ thể
export function broadcastMessage(targetUserIds: string[], message: any) {
  targetUserIds.forEach(userId => {
    const connection = connections.get(userId);
    if (connection) {
      try {
        connection.write(`data: ${JSON.stringify({ type: 'new_message', data: message })}\n\n`);
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        connections.delete(userId);
      }
    }
  });
}

// Hàm helper để broadcast đến phòng chat
export function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
  // Lấy danh sách thành viên phòng từ database
  pool.connect().then(client => {
    return client.query('SELECT user_id FROM chat_room_members WHERE room_id = $1', [roomId])
      .then(result => {
        const memberIds = result.rows
          .map(row => row.user_id)
          .filter(id => id !== excludeUserId);
        
        broadcastMessage(memberIds, message);
        client.release();
      })
      .catch(error => {
        console.error('Error getting room members:', error);
        client.release();
      });
  });
}
