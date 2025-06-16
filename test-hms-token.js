// Test script để kiểm tra HMS auth token
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

// Thay thế bằng credentials thực của bạn
const appAccessKey = 'YOUR_APP_ACCESS_KEY';
const appSecret = 'YOUR_APP_SECRET';

// Test tạo auth token
function createAuthToken(roomId, userId, role = 'guest') {
  const payload = {
    access_key: appAccessKey,
    room_id: roomId,
    user_id: userId,
    role: role,
    type: 'app',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000)
  };

  const token = jwt.sign(payload, appSecret, {
    algorithm: 'HS256',
    expiresIn: '24h',
    jwtid: uuid()
  });

  return token;
}

// Test
const testRoomId = 'test-room-123';
const testUserId = 'user-456';
const token = createAuthToken(testRoomId, testUserId);

console.log('Generated token:', token);

// Verify token
try {
  const decoded = jwt.verify(token, appSecret);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.error('Token verification failed:', error);
}
