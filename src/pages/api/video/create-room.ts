import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { roomName } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    // Get credentials from environment
    const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;
    const templateId = process.env.HMS_TEMPLATE_ID;
    
    if (!appAccessKey || !appSecret || !templateId) {
      console.error('Missing HMS credentials:', { appAccessKey: !!appAccessKey, appSecret: !!appSecret, templateId: !!templateId });
      return res.status(500).json({ error: 'HMS credentials not configured' });
    }

    // Create management token
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
        expiresIn: '24h',
        jwtid: uuid(),
      }
    );

    console.log('Creating room with name:', roomName);

    // Create room on 100ms
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName, // This is our custom room name
        description: 'Video call room created from UTC2 Admission Portal',
        template_id: templateId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('100ms API error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Failed to create room',
        details: errorData
      });
    }

    const roomData = await response.json();
    
    // Extract the REAL room ID from 100ms response
    const realRoomId = roomData.id; // This is the actual room ID we need to use
    
    console.log('Room created successfully:');
    console.log('- Room name (our custom):', roomName);
    console.log('- Room ID (from 100ms):', realRoomId);

    // Return both the room name and the REAL room ID
    return res.status(200).json({
      success: true,
      roomName: roomName, // Our custom room name
      roomId: realRoomId, // The REAL room ID from 100ms (this is what we'll use everywhere)
      roomData: roomData // Full response from 100ms
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
