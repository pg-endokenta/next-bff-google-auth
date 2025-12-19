import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { isProduction, requireEnv } from './env';

const SESSION_COOKIE = 'session_token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
};

export type Session = SessionUser & JWTPayload;

function getSecretKey() {
  const secret = requireEnv('SESSION_SECRET');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function readSessionFromCookies() {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const { payload } = await jwtVerify(raw, getSecretKey());
    return payload as Session;
  } catch (error) {
    return null;
  }
}

export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
