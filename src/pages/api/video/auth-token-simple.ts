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

  // Create a simpler, shorter room ID
  const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  const finalRoomId = `room-${sanitizedRoomId}`;

  try {
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;
    const templateId = process.env.HMS_TEMPLATE_ID;

    if (!appAccessKey || !appSecret || !templateId) {
      return res.status(500).json({ message: 'HMS credentials not configured. Please check .env.local file.' });
    }    // Step 1: Create room using Management API first
    let actualRoomId = finalRoomId;
    
    try {
      const createRoomResponse = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appAccessKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: finalRoomId,
          description: `Video call for ${finalRoomId}`,
          template_id: templateId,
          region: 'us'
        })
      });

      if (createRoomResponse.ok) {
        const roomData = await createRoomResponse.json();
        actualRoomId = roomData.id;
        console.log('Created new room:', actualRoomId);
      } else {
        // Room might already exist, try to find it
        const listRoomsResponse = await fetch(`https://api.100ms.live/v2/rooms?name=${finalRoomId}`, {
          headers: {
            'Authorization': `Bearer ${appAccessKey}`
          }
        });
        
        if (listRoomsResponse.ok) {
          const roomsList = await listRoomsResponse.json();
          if (roomsList.data && roomsList.data.length > 0) {
            actualRoomId = roomsList.data[0].id;
            console.log('Found existing room:', actualRoomId);
          } else {
            // If still can't find, use template room directly
            actualRoomId = templateId;
            console.log('Using template as room:', actualRoomId);
          }
        }
      }
    } catch (apiError) {
      console.log('Management API failed, using template room:', templateId);
      actualRoomId = templateId;
    }

    // Step 2: Create JWT token for the room
    const payload = {
      access_key: appAccessKey,
      room_id: actualRoomId,
      user_id: decodedToken.id,
      role: role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000)
    };

    const authToken = jwt.sign(payload, appSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuid()
    });    console.log('Generated token for room:', actualRoomId, 'user:', decodedToken.id);

    return res.status(200).json({
      authToken,
      roomId: actualRoomId,
      userId: decodedToken.id,
      userName: decodedToken.full_name || decodedToken.email || 'User'
    });

  } catch (error: any) {
    console.error('Error generating HMS token:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo token: ' + (error.message || 'Unknown error') });
  }
}
