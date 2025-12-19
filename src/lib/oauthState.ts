import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isProduction } from './env';

type StoredState = {
  state: string;
  returnTo?: string;
};

const STATE_COOKIE = 'oauth_state';
const STATE_MAX_AGE = 60 * 10; // 10 minutes

export function persistState(response: NextResponse, state: StoredState) {
  response.cookies.set(STATE_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/api/auth',
    maxAge: STATE_MAX_AGE,
  });
}

export function readState(): StoredState | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(STATE_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredState;
  } catch (error) {
    return null;
  }
}

export function clearState(response: NextResponse) {
  response.cookies.delete(STATE_COOKIE, { path: '/api/auth' });
}
