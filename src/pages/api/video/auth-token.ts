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
  }

  const { roomId, role = 'guest' } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }

  try {
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;
    const templateId = process.env.HMS_TEMPLATE_ID;

    if (!appAccessKey || !appSecret || !templateId) {
      return res.status(500).json({ message: 'HMS credentials not configured' });
    }

    // Step 1: Create management token
    const managementToken = jwt.sign(
      {
        access_key: appAccessKey,
        type: 'management',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
      },
      appSecret,
      {
        algorithm: 'HS256',
        expiresIn: '10m',
        jwtid: uuid(),
      }
    );

    // Step 2: Try to create room
    const createRoomRes = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomId,
        description: `Chat room for ${roomId}`,
        template_id: templateId,
        region: 'us',
      }),
    });

    let actualRoomId;
    if (createRoomRes.ok) {
      const roomData = await createRoomRes.json();
      actualRoomId = roomData.id;
    } else {
      // Step 3: Room might already exist
      const getRoomRes = await fetch(`https://api.100ms.live/v2/rooms?name=${roomId}`, {
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      });

      if (getRoomRes.ok) {
        const roomsData = await getRoomRes.json();
        if (roomsData.data && roomsData.data.length > 0) {
          actualRoomId = roomsData.data[0].id;
        } else {
          throw new Error('Could not create or find room');
        }
      } else {
        throw new Error('Failed to create/get room');
      }
    }

    // Step 4: Generate auth token for user to join room
    const userTokenPayload = {
      access_key: appAccessKey,
      room_id: actualRoomId,
      user_id: decodedToken.id,
      role,
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

    return res.status(200).json({
      authToken,
      roomId: actualRoomId,
      userId: decodedToken.id,
      userName: decodedToken.full_name || decodedToken.email,
    });
  } catch (error: any) {
    console.error('Error generating HMS token:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo token: ' + (error.message || 'Unknown error') });
  }
}
