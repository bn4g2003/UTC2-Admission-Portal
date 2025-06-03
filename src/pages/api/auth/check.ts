import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/auth';
import pool from '../../../../lib/db';
import error from 'next/error';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = await pool.connect();
    try {
    // Get user details from database
    const result = await client.query(
      'SELECT id, email, role, full_name FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({ message: 'Không thể xác thực người dùng' });
  } finally {
    client.release();
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
} )