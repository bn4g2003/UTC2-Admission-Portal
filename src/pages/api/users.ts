// src/pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db'; // Đảm bảo đường dẫn đúng
import { verifyAuthToken } from '../../../lib/auth'; // Đảm bảo đường dẫn đúng
import { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Chỉ chấp nhận phương thức GET cho việc lấy danh sách
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Chỉ chấp nhận phương thức GET' });
  }

  try {
    // 1. Xác thực và kiểm tra vai trò (chỉ truongban mới được xem)
    const token = req.cookies.token; // Lấy token từ cookie
    if (!token) {
      return res.status(401).json({ message: 'Không có quyền truy cập.' });
    }

    let decodedToken: JwtPayload; // Khai báo kiểu rõ ràng cho decodedToken
    try {
      decodedToken = verifyAuthToken(token) as JwtPayload; // Ép kiểu ở đây
    } catch (authError) {
      console.error('Lỗi xác thực token khi lấy user list:', authError);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
    }

    if (decodedToken.role !== 'TRUONGBAN') { // Bây giờ TypeScript biết `decodedToken` có `role`
      return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
    }

    // 2. Kết nối DB và lấy danh sách người dùng (không bao gồm password_hash)
    const client = await pool.connect();
    const result = await client.query('SELECT id, email, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    const users = result.rows;
    client.release();

    return res.status(200).json({ users });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách người dùng.' });
  }
}