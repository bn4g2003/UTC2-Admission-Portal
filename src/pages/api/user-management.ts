// src/pages/api/user-management.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db'; // Đảm bảo đường dẫn đúng
import { verifyAuthToken } from '../../../lib/auth'; // Đảm bảo đường dẫn đúng
import { hashPassword } from '../../../lib/auth'; // Giả sử bạn có hàm hashPassword trong auth.ts

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
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mật khẩu và vai trò là bắt buộc.' });
      }

      // Kiểm tra email trùng lặp
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ message: 'Email đã tồn tại.' });
      }

      const hashedPassword = await hashPassword(password); // Hash mật khẩu trước khi lưu
      const result = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
        [email, hashedPassword, role]
      );
      return res.status(201).json({ message: 'Người dùng đã được tạo thành công.', user: result.rows[0] });

    } else if (req.method === 'PUT') {
      // SỬA THÔNG TIN NGƯỜI DÙNG
      // Lấy ID từ req.query vì nó được gửi qua URL
      const { id } = req.query;
      const { email, role, password } = req.body;

      if (!id || typeof id !== 'string' || (!email && !role && !password)) {
        return res.status(400).json({ message: 'ID người dùng và ít nhất một trường để cập nhật là bắt buộc.' });
      }

      let updateQuery = 'UPDATE users SET updated_at = NOW()';
      const queryParams = [];
      let paramCount = 1;

      if (email) {
        // Kiểm tra email trùng lặp nếu email được cập nhật
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
        if (existingUser.rows.length > 0) {
          return res.status(409).json({ message: 'Email đã tồn tại bởi người dùng khác.' });
        }
        updateQuery += `, email = $${paramCount}`;
        queryParams.push(email);
        paramCount++;
      }
      if (role) {
        updateQuery += `, role = $${paramCount}`;
        queryParams.push(role);
        paramCount++;
      }
      if (password) {
        const hashedPassword = await hashPassword(password);
        updateQuery += `, password_hash = $${paramCount}`;
        queryParams.push(hashedPassword);
        paramCount++;
      }

      updateQuery += ` WHERE id = $${paramCount} RETURNING id, email, role, created_at, updated_at`;
      queryParams.push(id); // ID là tham số cuối cùng

      const result = await client.query(updateQuery, queryParams);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
      }

      return res.status(200).json({ message: 'Người dùng đã được cập nhật thành công.', user: result.rows[0] });

    } else if (req.method === 'DELETE') {
      // XÓA NGƯỜI DÙNG
      // Lấy ID từ req.query vì nó được gửi qua URL
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID người dùng là bắt buộc.' });
      }

      // Đảm bảo không xóa chính tài khoản đang đăng nhập
      if (id === decodedToken.id) {
        return res.status(403).json({ message: 'Không thể xóa chính tài khoản của bạn.' });
      }

      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
      }

      return res.status(200).json({ message: 'Người dùng đã được xóa thành công.', id: result.rows[0].id });

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
