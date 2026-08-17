import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { connectDB } from './db';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ganesh_puja_jwt_key_2026_change_in_production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'member';
  name: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// JWT handling
export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

// Cookie helper
export const COOKIE_NAME = 'auth_token';

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromRequest(req?: NextRequest): Promise<string | null> {
  if (req) {
    // Check Authorization Header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    // Check Cookie
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    if (cookieToken) return cookieToken;
  }
  // Check Next.js server context cookie
  try {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<IUser | null> {
  const token = await getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  await connectDB();
  const user = await User.findById(payload.userId).select('-password');
  if (!user || user.status !== 'active') return null;

  return user;
}
