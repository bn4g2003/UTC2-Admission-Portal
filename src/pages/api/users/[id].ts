import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken, hashPassword } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
  }

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
        const user = await client.query(`
          SELECT id, email, full_name, role, phone_number, 
                 address, date_of_birth, created_at, updated_at
          FROM users
          WHERE id = $1
        `, [id]);

        if (user.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        return res.status(200).json(user.rows[0]);

      case 'PUT':
        const { email, password, full_name, role, phone_number, address, date_of_birth } = req.body;

        // Check if user exists
        const existingUser = await client.query('SELECT id FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Build update query
        let updateFields = [];
        let values = [];
        let paramCount = 1;

        if (email) {
          // Check if email is already used by another user
          const emailCheck = await client.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, id]
          );
          if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Email đã được sử dụng.' });
          }
          updateFields.push(`email = $${paramCount}`);
          values.push(email);
          paramCount++;
        }

        if (password) {
          const hashedPassword = await hashPassword(password);
          updateFields.push(`password_hash = $${paramCount}`);
          values.push(hashedPassword);
          paramCount++;
        }

        if (role) {
          updateFields.push(`role = $${paramCount}`);
          values.push(role);
          paramCount++;
        }

        if (full_name) {
          updateFields.push(`full_name = $${paramCount}`);
          values.push(full_name);
          paramCount++;
        }

        if (phone_number !== undefined) {
          updateFields.push(`phone_number = $${paramCount}`);
          values.push(phone_number);
          paramCount++;
        }

        if (address !== undefined) {
          updateFields.push(`address = $${paramCount}`);
          values.push(address);
          paramCount++;
        }

        if (date_of_birth) {
          updateFields.push(`date_of_birth = $${paramCount}`);
          values.push(date_of_birth);
          paramCount++;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add ID to values array
        values.push(id);

        const updateQuery = `
          UPDATE users 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING id, email, full_name, role, phone_number, 
                    address, date_of_birth, created_at, updated_at
        `;

        const updatedUser = await client.query(updateQuery, values);
        return res.status(200).json({
          message: 'Cập nhật thông tin người dùng thành công.',
          user: updatedUser.rows[0]
        });      case 'DELETE':
        // Check if user exists
        const userToDelete = await client.query(
          'SELECT role FROM users WHERE id = $1',
          [id]
        );

        if (userToDelete.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Prevent deleting the last TRUONGBAN
        if (userToDelete.rows[0].role === 'TRUONGBAN') {
          const truongbanCount = await client.query(
            "SELECT COUNT(*) FROM users WHERE role = 'TRUONGBAN'"
          );
          if (parseInt(truongbanCount.rows[0].count) <= 1) {
            return res.status(403).json({
              message: 'Không thể xóa Trưởng ban cuối cùng.'
            });
          }
        }

        // Begin transaction
        await client.query('BEGIN');

        try {          // Xóa tất cả assignments của user này
          await client.query('DELETE FROM assignments WHERE assigned_to = $1', [id]);
          
          // Sau đó xóa user
          await client.query('DELETE FROM users WHERE id = $1', [id]);
          
          await client.query('COMMIT');
          
          return res.status(200).json({
            message: 'Xóa người dùng thành công.'
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
} 