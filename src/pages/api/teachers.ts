import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { verifyAuthToken } from '../../../lib/auth';

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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Phương thức ${req.method} không được phép` });
  }

  const client = await pool.connect();
  try {
    // Lấy danh sách giáo viên (có thể thêm tham số search để lọc)
    const { search } = req.query;
    let query = `
      SELECT id, email, full_name, phone_number 
      FROM users 
      WHERE role = 'GIAOVIEN'
    `;
    const queryParams = [];

    if (search && typeof search === 'string') {
      query += ` AND (
        LOWER(email) LIKE LOWER($1) OR 
        LOWER(full_name) LIKE LOWER($1) OR 
        phone_number LIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    query += ' ORDER BY full_name ASC';

    const result = await client.query(query, queryParams);

    return res.status(200).json({ teachers: result.rows });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách giáo viên:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách giáo viên.' });
  } finally {
    client.release();
  }
} 