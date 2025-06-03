import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the auth cookie by setting an expired date
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Setting an expired date effectively deletes the cookie
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ message: 'Đăng xuất thành công' });
}
