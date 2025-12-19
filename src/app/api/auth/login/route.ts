import { NextResponse, type NextRequest } from 'next/server';
import { buildGoogleAuthUrl } from '@/lib/googleClient';
import { persistState } from '@/lib/oauthState';

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const returnTo = request.nextUrl.searchParams.get('returnTo') ?? '/';
  const authorizationUrl = buildGoogleAuthUrl(state);

  const response = NextResponse.redirect(authorizationUrl);
  persistState(response, { state, returnTo });

  return response;
}
