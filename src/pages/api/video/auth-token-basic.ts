import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthToken } from '../../../../lib/auth';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken: any; // Định nghĩa kiểu cụ thể hơn nếu có thể
  try {
    decodedToken = verifyAuthToken(token);
  } catch (authError) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }

  // Lấy roomId từ body request - đây sẽ là ID phòng thực tế mà người dùng muốn tham gia
  const { roomId, role = 'guest' } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }

  try {
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;
    const templateId = process.env.HMS_TEMPLATE_ID; // templateId vẫn cần để áp dụng cấu hình phòng

    if (!appAccessKey || !appSecret || !templateId) {
      return res.status(500).json({ message: 'HMS credentials not configured. Please check .env.local file.' });
    }

    // `actualRoomId` bây giờ là `roomId` được gửi từ client
    const actualRoomId = roomId;

    const payload = {
      access_key: appAccessKey,
      room_id: actualRoomId, // SỬ DỤNG roomId THỰC TẾ ĐƯỢC YÊU CẦU TỪ CLIENT
      user_id: decodedToken.id.toString(),
      role: role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      template: templateId, // GỬI templateId VÀO PAYLOAD ĐỂ ÁP DỤNG CẤU HÌNH PHÒNG
    };

    const authToken = jwt.sign(payload, appSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuid(),
    });

    console.log('Generated token for room:', actualRoomId, 'user:', decodedToken.id, 'with template:', templateId);

    return res.status(200).json({
      authToken,
      roomId: actualRoomId, // Trả về roomId thực tế
      userId: decodedToken.id,
      userName: decodedToken.full_name || decodedToken.email || 'User',
    });
  } catch (error: any) {
    console.error('Error generating HMS token:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo token: ' + (error.message || 'Unknown error') });
  }
}