import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';
import { hashPassword } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Xác thực token và vai trò
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken;
  try {
    decodedToken = verifyAuthToken(token);
  } catch (authError) {
    console.error('Lỗi xác thực token:', authError);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }

  if (decodedToken.role !== 'TRUONGBAN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }

  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':
        const result = await client.query(`
          SELECT id, email, full_name, role, phone_number, address, 
                 date_of_birth, created_at, updated_at
          FROM users
          ORDER BY created_at DESC
        `);
        return res.status(200).json(result.rows);

      case 'POST':
        const { email, password, full_name, role, phone_number, address, date_of_birth } = req.body;

        // Validate required fields
        if (!email || !password || !role) {
          return res.status(400).json({ message: 'Email, mật khẩu và vai trò là bắt buộc.' });
        }

        // Check if email already exists
        const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
          return res.status(409).json({ message: 'Email đã tồn tại.' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new user
        const newUser = await client.query(`
          INSERT INTO users (
            email, password_hash, role, full_name, 
            phone_number, address, date_of_birth
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, email, role, full_name, phone_number, 
                    address, date_of_birth, created_at, updated_at
        `, [email, hashedPassword, role, full_name, phone_number, address, date_of_birth]);

        return res.status(201).json({
          message: 'Người dùng đã được tạo thành công.',
          user: newUser.rows[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
} 