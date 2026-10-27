import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fleetflow-secure-jwt-secret-key-codsoft-task-5';
const TOKEN_NAME = 'fleetflow_token';

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare plain password with stored hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from Request cookies or Authorization header
 */
export async function getAuthUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (request && request.headers) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 2. Check Next.js Cookies
    if (!token) {
      try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(TOKEN_NAME);
        if (cookie) token = cookie.value;
      } catch {
        // Fallback if cookies() is called outside server component/handler
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export { TOKEN_NAME };
