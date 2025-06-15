import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET ;
const APP_URL = process.env.APP_URL ;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Vui lòng nhập email.' });
  }
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Luôn trả về thành công để tránh dò email
      return res.status(200).json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' });
    }
    const user = result.rows[0];
    // Tạo token reset có hạn 30 phút
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const resetToken = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '30m' });
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
    // Gửi email (cấu hình lại transporter cho phù hợp)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `UTC2 Tuyển sinh <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu tài khoản UTC2',
      html: `<p>Xin chào ${user.full_name || ''},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để tạo mật khẩu mới (liên kết có hiệu lực 30 phút):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`
    });
    return res.status(200).json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server khi gửi email.' });
  } finally {
    client.release();
  }
}
