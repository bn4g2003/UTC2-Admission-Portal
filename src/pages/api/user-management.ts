// src/pages/api/user-management.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db'; // Đảm bảo đường dẫn đúng
import { verifyAuthToken } from '../../../lib/auth'; // Đảm bảo đường dẫn đúng
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Xác thực token và vai trò cho TẤT CẢ các phương thức
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

  // Chú ý: Vai trò trong token thường được lưu trữ bằng chữ thường (lowercase)
  // Hãy đảm bảo rằng vai trò trong decodedToken.role khớp với giá trị bạn mong đợi,
  // ví dụ 'truongban' thay vì 'TRUONGBAN' nếu bạn lưu trữ như vậy.
  if (decodedToken.role !== 'TRUONGBAN') { // Đã sửa thành 'truongban' (chữ thường)
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }

  const client = await pool.connect(); // Mở kết nối trước khi vào switch
  try {
    if (req.method === 'POST') {
      // THÊM NGƯỜI DÙNG MỚI
      const { email, password, role, full_name, phone_number, address, date_of_birth } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mật khẩu và vai trò là bắt buộc.' });
      }

      // Kiểm tra email đã tồn tại chưa
      const checkEmail = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1',
        [email]
      );

      if (parseInt(checkEmail.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Email này đã được sử dụng.' });
      }

      // Hash mật khẩu
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await client.query(
        `INSERT INTO users (
          email, password_hash, role, full_name, phone_number, address, date_of_birth
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email, role, full_name, phone_number, address, date_of_birth, created_at`,
        [email, password_hash, role, full_name, phone_number, address, date_of_birth]
      );

      return res.status(201).json({
        message: 'Người dùng đã được tạo thành công.',
        user: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // SỬA THÔNG TIN NGƯỜI DÙNG
      // Lấy ID từ req.query vì nó được gửi qua URL
      const { id } = req.query;
      const { email, password, role, full_name, phone_number, address, date_of_birth } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID người dùng là bắt buộc.' });
      }

      if (!email || !role) {
        return res.status(400).json({ message: 'Email và vai trò là bắt buộc.' });
      }

      // Kiểm tra email đã tồn tại chưa (trừ email hiện tại)
      const checkEmail = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (parseInt(checkEmail.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Email này đã được sử dụng.' });
      }

      let updateFields = [];
      let updateValues = [email, role, full_name, phone_number, address, date_of_birth];
      let valueCounter = updateValues.length;

      // Cập nhật các trường cơ bản
      updateFields.push(
        'email = $1',
        'role = $2',
        'full_name = $3',
        'phone_number = $4',
        'address = $5',
        'date_of_birth = $6'
      );

      // Nếu có mật khẩu mới, hash và thêm vào câu lệnh update
      if (password) {
        const password_hash = await bcrypt.hash(password, 10);
        updateValues.push(password_hash);
        valueCounter++;
        updateFields.push(`password_hash = $${valueCounter}`);
      }

      // Thêm ID vào cuối mảng giá trị
      updateValues.push(id);
      valueCounter++;

      const result = await client.query(
        `UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${valueCounter}
        RETURNING id, email, role, full_name, phone_number, address, date_of_birth, created_at, updated_at`,
        updateValues
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
      }

      return res.status(200).json({
        message: 'Người dùng đã được cập nhật thành công.',
        user: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // XÓA NGƯỜI DÙNG
      // Lấy ID từ req.query vì nó được gửi qua URL
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID người dùng là bắt buộc.' });
      }

      // Kiểm tra xem người dùng có phải là TRUONGBAN không
      const checkRole = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [id]
      );

      if (checkRole.rows[0]?.role === 'TRUONGBAN') {
        return res.status(400).json({ message: 'Không thể xóa tài khoản Trưởng ban.' });
      }

      // Kiểm tra xem người dùng có đang được phân công không
      const checkAssignments = await client.query(
        'SELECT COUNT(*) as count FROM assignments WHERE assigned_to = $1',
        [id]
      );

      if (parseInt(checkAssignments.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: 'Không thể xóa người dùng này vì đang có phân công.'
        });
      }

      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
      }

      return res.status(200).json({
        message: 'Người dùng đã được xóa thành công.',
        id: result.rows[0].id
      });

    } else {
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Phương thức ${req.method} không được phép` });
    }
  } catch (error) {
    console.error('Lỗi khi quản lý người dùng:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi quản lý người dùng.' });
  } finally {
    client.release(); // Luôn giải phóng kết nối
  }
}
