import { NextResponse, type NextRequest } from 'next/server';
import { getOAuthClient } from '@/lib/googleClient';
import { clearState, readState } from '@/lib/oauthState';
import { applySessionCookie, createSessionToken } from '@/lib/session';
import { requireEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const storedState = await readState();

  if (!code || !returnedState) {
    return NextResponse.json({ error: 'リクエストが不正です。code/stateが不足しています。' }, { status: 400 });
  }

  if (!storedState || storedState.state !== returnedState) {
    return NextResponse.json({ error: 'state検証に失敗しました。やり直してください。' }, { status: 400 });
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken({ code, redirect_uri: requireEnv('GOOGLE_REDIRECT_URI') });

    if (!tokens.id_token) {
      return NextResponse.json({ error: 'IDトークンが取得できませんでした。' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: requireEnv('GOOGLE_CLIENT_ID') });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      return NextResponse.json({ error: '必須のプロフィール情報が不足しています。' }, { status: 400 });
    }

    const token = await createSessionToken({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    const redirectUrl = storedState.returnTo ?? '/';
    const response = NextResponse.redirect(redirectUrl);
    applySessionCookie(response, token);
    clearState(response);

    return response;
  } catch (error) {
    console.error('Callback error', error);
    return NextResponse.json({ error: 'ログイン処理中にエラーが発生しました。' }, { status: 500 });
  }
}
