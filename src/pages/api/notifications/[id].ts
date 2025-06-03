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

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID thông báo không hợp lệ.' });
  }

  const client = await pool.connect();

  try {
    switch (req.method) {
      case 'GET':
        const notification = await client.query(`
          SELECT 
            n.id,
            n.title,
            n.content,
            n.created_at,
            u.full_name as created_by_name,
            u.email as created_by_email
          FROM notifications n
          JOIN users u ON n.created_by = u.id
          WHERE n.id = $1
        `, [id]);

        if (notification.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        return res.status(200).json(notification.rows[0]);

      case 'DELETE':
        // Chỉ TRUONGBAN mới được xóa thông báo
        if (decodedToken.role !== 'TRUONGBAN') {
          return res.status(403).json({ message: 'Chỉ Trưởng ban mới có quyền xóa thông báo.' });
        }

        const deleteResult = await client.query(
          'DELETE FROM notifications WHERE id = $1 RETURNING id',
          [id]
        );

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa.' });
        }

        return res.status(200).json({ message: 'Xóa thông báo thành công.' });

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
}
