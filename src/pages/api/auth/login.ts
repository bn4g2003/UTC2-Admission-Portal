// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { comparePassword, generateAuthToken } from '../../../../lib/auth';
import { serialize } from 'cookie'; // Import the 'cookie' library to set cookies

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.log('API Login: Phương thức không được phép');
    return res.status(405).json({ message: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const { email, password } = req.body;
    console.log(`API Login: Đang cố gắng đăng nhập cho email: ${email}`);

    if (!email || !password) {
      console.log('API Login: Thiếu email hoặc mật khẩu');
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const client = await pool.connect();
    console.log('API Login: Đã kết nối đến DB.');
    const result = await client.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    client.release();
    console.log('API Login: Kết nối DB đã được giải phóng.');

    if (!user) {
      console.log('API Login: Người dùng không tìm thấy');
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    console.log(`API Login: Mật khẩu hợp lệ: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = generateAuthToken(user.id, user.role);
    console.log('API Login: Token đã được tạo.');

    // -----------------------------------------------------------
    // THE CRUCIAL CHANGE: Set the token as an HTTP-only cookie
    // -----------------------------------------------------------
    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        sameSite: 'strict', // Protects against CSRF attacks
        maxAge: 60 * 60, // 1 hour (matches JWT expiry)
        path: '/', // Make the cookie available across the entire domain
      })
    );

    // -----------------------------------------------------------

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      // You can still send the token in the body if your frontend needs to read it directly,
      // but for getServerSideProps, setting it as a cookie is key.
      // For security, it's generally better to *only* send it as an httpOnly cookie
      // if the client doesn't explicitly need it in JS.
      // token, // Consider removing this if client doesn't need it for security
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('API Login: Lỗi máy chủ nội bộ:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
}