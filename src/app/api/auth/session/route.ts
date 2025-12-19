import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/session';

export async function GET() {
  const session = await readSessionFromCookies();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const { email, name, picture } = session;
  return NextResponse.json({ authenticated: true, user: { email, name, picture } });
}
