// E:\chat_bot\src\pages\api\auth\login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db'; // Đảm bảo đường dẫn đúng
import { comparePassword, generateAuthToken } from '../../../../lib/auth'; // Đảm bảo đường dẫn đúng
import { serialize } from 'cookie'; // Dùng để đặt HttpOnly cookie

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Chỉ chấp nhận phương thức POST' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
  }

  const client = await pool.connect();

  try {
    // 1. Tìm người dùng theo email
    const userResult = await client.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // 2. So sánh mật khẩu
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // 3. Tạo JWT token
    const token = generateAuthToken(user.id, user.role);

    // 4. Đặt token vào HttpOnly cookie
    // HttpOnly: Ngăn JavaScript truy cập cookie, tăng cường bảo mật XSS
    // Secure: Chỉ gửi qua HTTPS (quan trọng cho môi trường production)
    // SameSite: 'Lax' hoặc 'Strict' để chống CSRF (tùy thuộc vào yêu cầu)
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true nếu là HTTPS, false nếu là HTTP (dev)
      path: '/', // Cookie khả dụng trên toàn bộ ứng dụng
      maxAge: 60 * 60 * 24 * 7, // 1 tuần (thời gian sống của cookie)
      sameSite: 'lax', // Hoặc 'strict'
    });

    res.setHeader('Set-Cookie', cookie);

    // 5. Trả về thông tin người dùng (không chứa mật khẩu)
    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        // Không trả về password_hash
      },
    });

  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ trong quá trình đăng nhập.' });
  } finally {
    client.release(); // Giải phóng kết nối database
  }
}