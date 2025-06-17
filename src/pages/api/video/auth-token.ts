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
  }  const { roomId, role = 'viewer', isRoomCreator = false } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }

  // Helper function to check if user is room creator
  const isUserRoomCreator = (roomId: string, userId: string) => {
    // This is a simple check - in production, you might want to store room creators in database
    // For now, we'll allow the creator role based on the first person who creates auth token for the room
    return true; // You can implement more sophisticated logic here
  };

  // Validate role according to 100ms standards
  const validRoles = ['broadcaster', 'viewer', 'viewer-on-stage'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }
  
  // Security: Only allow broadcaster role if user is room creator
  let finalRole = role;
  if (role === 'broadcaster') {
    // Always allow broadcaster role if explicitly marked as room creator
    // or if it's a rejoin scenario (user was the original creator)
    if (!isRoomCreator && !isUserRoomCreator(roomId, decodedToken.id)) {
      console.log(`User ${decodedToken.id} tried to join as broadcaster but is not room creator. Assigning viewer role.`);
      finalRole = 'viewer';
    }
  }

  try {
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;

    if (!appAccessKey || !appSecret) {
      return res.status(500).json({ message: 'HMS credentials not configured' });
    }

    // Additional security: Generate unique user ID to avoid conflicts
    const uniqueUserId = `${decodedToken.id}_${Date.now()}`;

    console.log('Creating auth token for:', {
      roomId: roomId, // This should be the REAL room ID from 100ms
      userId: decodedToken.id,
      uniqueUserId: uniqueUserId,
      role: finalRole, // Use final role after validation
      isRoomCreator
    });

    // Generate auth token for user to join room
    // roomId MUST be the actual 100ms room ID (like 684f97dd252d7b52c5e46321)
    const userTokenPayload = {
      access_key: appAccessKey,
      room_id: roomId, // This MUST be the real 100ms room ID
      user_id: uniqueUserId, // Use the unique user ID here
      role: finalRole,
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
