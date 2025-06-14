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
    console.error('Lỗi xác thực token:', authError);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }

  if (decodedToken.role !== 'GIAOVIEN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Giáo viên được phép.' });
  }

  const client = await pool.connect();

  try {
    // GET: Lấy thông tin người dùng
    if (req.method === 'GET') {
      const result = await client.query(`
        SELECT 
          id, 
          email, 
          role, 
          full_name, 
          phone_number, 
          address, 
          date_of_birth
        FROM users
        WHERE id = $1
      `, [decodedToken.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
      }

      return res.status(200).json(result.rows[0]);
    }
    
    // PUT: Cập nhật thông tin người dùng
    if (req.method === 'PUT') {
      const { full_name, phone_number, address, date_of_birth } = req.body;

      // Xây dựng câu lệnh UPDATE động
      let updateFields = [];
      let params = [];
      let paramCount = 1;

      if (full_name !== undefined) {
        updateFields.push(`full_name = $${paramCount}`);
        params.push(full_name);
        paramCount++;
      }

      if (phone_number !== undefined) {
        updateFields.push(`phone_number = $${paramCount}`);
        params.push(phone_number);
        paramCount++;
      }

      if (address !== undefined) {
        updateFields.push(`address = $${paramCount}`);
        params.push(address);
        paramCount++;
      }

      if (date_of_birth !== undefined) {
        updateFields.push(`date_of_birth = $${paramCount}`);
        params.push(date_of_birth);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Không có thông tin nào để cập nhật.' });
      }

      // Thêm ID người dùng vào các tham số
      params.push(decodedToken.id);

      const updateQuery = `
        UPDATE users
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, email, role, full_name, phone_number, address, date_of_birth
      `;

      const result = await client.query(updateQuery, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Cập nhật thất bại. Không tìm thấy người dùng.' });
      }

      return res.status(200).json({
        message: 'Cập nhật thông tin thành công.',
        user: result.rows[0]
      });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('Database error in profile API:', error);
    return res.status(500).json({ 
      message: 'Lỗi server nội bộ khi xử lý thông tin cá nhân.',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    client.release();
  }
}
