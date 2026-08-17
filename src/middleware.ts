import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ganesh_puja_jwt_key_2026_change_in_production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'auth_token';

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, _next, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Get token from cookie or Authorization header
  let token = request.cookies.get(COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization');
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isValidToken = true;
    } catch (err) {
      isValidToken = false;
    }
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    if (!isPublic && !isValidToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access. Please log in.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Redirect to dashboard if logged in and trying to access /login
  if (pathname === '/login' && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if trying to access protected route without token
  if (!isPublic && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
