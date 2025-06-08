import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import { verifyAuthToken } from '../../../../lib/auth';
import { hashPassword } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken;
  try {
    decodedToken = verifyAuthToken(token);
    const client = await pool.connect();

    if (req.method === 'GET') {
      const result = await client.query(`
        SELECT id, email, full_name, phone_number, address, date_of_birth
        FROM users 
        WHERE id = $1
      `, [decodedToken.id]);

      return res.status(200).json(result.rows[0]);
    } else if (req.method === 'PUT') {
      const { full_name, phone_number, address, date_of_birth } = req.body;

      const result = await client.query(`
        UPDATE users
        SET full_name = $1, phone_number = $2, address = $3, date_of_birth = $4
        WHERE id = $5
        RETURNING id, email, full_name, phone_number, address, date_of_birth
      `, [full_name, phone_number, address, date_of_birth, decodedToken.id]);

      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(405).json({ message: 'Phương thức không được hỗ trợ.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server' });
  }
}