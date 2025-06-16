import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthToken } from '../../../../lib/auth';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập.' });
  }

  let decodedToken;
  try {
    decodedToken = verifyAuthToken(token);
  } catch (authError) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
  }  const { roomId, role = 'viewer' } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }

  // Validate role according to 100ms standards
  const validRoles = ['broadcaster', 'viewer', 'viewer-on-stage'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;

    if (!appAccessKey || !appSecret) {
      return res.status(500).json({ message: 'HMS credentials not configured' });
    }

    console.log('Creating auth token for:', {
      roomId: roomId, // This should be the REAL room ID from 100ms
      userId: decodedToken.id,
      role
    });

    // Generate auth token for user to join room
    // roomId MUST be the actual 100ms room ID (like 684f97dd252d7b52c5e46321)
    const userTokenPayload = {
      access_key: appAccessKey,
      room_id: roomId, // This MUST be the real 100ms room ID
      user_id: decodedToken.id.toString(),
      role: role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    const authToken = jwt.sign(userTokenPayload, appSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuid(),
    });

    console.log('Auth token created successfully for room:', roomId);

    return res.status(200).json({
      authToken,
      roomId: roomId, // Return the same room ID
      userId: decodedToken.id,
      userName: decodedToken.full_name || decodedToken.email,
    });} catch (error: any) {
    console.error('Error generating HMS token:', error);
    return res.status(500).json({ 
      message: 'Lỗi server khi tạo token: ' + (error.message || 'Unknown error'),
      details: error.stack 
    });
  }
}
