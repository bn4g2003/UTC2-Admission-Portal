import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../../lib/db';
import { verifyAuthToken } from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
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

  if (decodedToken.role !== 'GIAOVIEN') {
    return res.status(403).json({ message: 'Không có quyền đổi mật khẩu.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  const client = await pool.connect();
  try {
    // Lấy hash mật khẩu hiện tại
    const result = await client.query('SELECT password_hash FROM users WHERE id = $1', [decodedToken.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    // Hash mật khẩu mới
    const newHash = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, decodedToken.id]);
    return res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.', error: String(error) });
  } finally {
    client.release();
  }
}
