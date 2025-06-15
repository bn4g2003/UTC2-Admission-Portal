// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Cần cài đặt bcryptjs
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_if_not_in_env';
const SALT_ROUNDS = 10; // Số vòng lặp để hash mật khẩu, càng cao càng an toàn nhưng chậm hơn

export interface DecodedToken {
  email: any;
  full_name: any;
  userId: any;
  id: string;
  role: string;
  iat: number; // Issued At
  exp: number; // Expiration
}
const TOKEN_EXPIRATION = '24h'; // Tăng thời gian sống của token lên 24 giờ
const REFRESH_THRESHOLD = 60 * 60; // 1 giờ tính bằng giây

export function generateAuthToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role: role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

export function verifyAuthToken(token: string): DecodedToken {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = verifyAuthToken(token);
    // Làm mới token nếu còn ít hơn REFRESH_THRESHOLD giây
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < REFRESH_THRESHOLD;
  } catch {
    return false;
  }
}

// Hàm mới: Hash mật khẩu
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

// Hàm so sánh mật khẩu (đã có)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Extend NextApiRequest to include user information
export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    role: string;
  };
}

// withAuth middleware for API routes
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from cookies
      const token = req.cookies['token'];
      
      if (!token) {
        console.error('No auth token found in cookies');
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để tiếp tục.',
          code: 'TOKEN_MISSING'
        });
      }

      // Verify token
      let decoded: DecodedToken;
      try {
        decoded = verifyAuthToken(token);
      } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ 
          message: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.',
          code: 'TOKEN_EXPIRED'
        });
      }

      // Check if token should be refreshed
      if (shouldRefreshToken(token)) {
        // Generate new token
        const newToken = generateAuthToken(decoded.id, decoded.role);
        
        // Set new token in cookie
        res.setHeader('Set-Cookie', [
          `token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}` // 24 hours
        ]);
        
        console.log('Token refreshed for user:', decoded.id);
      }

      // Add user info to request
      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        role: decoded.role
      };

      // Call the handler
      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  };
}