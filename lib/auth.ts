// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Cần cài đặt bcryptjs

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_if_not_in_env';
const SALT_ROUNDS = 10; // Số vòng lặp để hash mật khẩu, càng cao càng an toàn nhưng chậm hơn

export interface DecodedToken {
  userId: any;
  email: any;
  id: string;
  role: string;
  iat: number; // Issued At
  exp: number; // Expiration
}
export function generateAuthToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role: role }, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyAuthToken(token: string): DecodedToken {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
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