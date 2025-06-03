import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../../lib/auth';
import pool from '../../../../../lib/db';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse){
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Only TRUONGBAN can review reports
  if (req.user.role !== 'TRUONGBAN') {
    return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ Trưởng ban được phép.' });
  }

  const { id } = req.query;
  const { status, review_comments } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID báo cáo không hợp lệ.' });
  }

  if (!status || !['reviewed', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  if (!review_comments || typeof review_comments !== 'string') {
    return res.status(400).json({ message: 'Nhận xét không được để trống.' });
  }

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    // Check if report exists and is in submitted status
    const checkReport = await client.query(
      'SELECT status FROM reports WHERE id = $1',
      [id]
    );

    if (checkReport.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Không tìm thấy báo cáo.' });
    }

    if (checkReport.rows[0].status !== 'submitted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Báo cáo này đã được duyệt.' });
    }

    // Update report status
    const result = await client.query(`
      UPDATE reports 
      SET 
        status = $1, 
        review_comments = $2,
        reviewed_by = $3,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, review_comments, req.user.id, id]);

    await client.query('COMMIT');

    return res.status(200).json({ 
      message: 'Đã duyệt báo cáo thành công.',
      report: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
});
