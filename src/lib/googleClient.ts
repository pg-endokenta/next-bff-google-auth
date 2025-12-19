import { OAuth2Client } from 'google-auth-library';
import { requireEnv } from './env';

const scopes = ['openid', 'email', 'profile'];

export function getOAuthClient() {
  const clientId = requireEnv('GOOGLE_CLIENT_ID');
  const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
  const redirectUri = requireEnv('GOOGLE_REDIRECT_URI');

  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

export function buildGoogleAuthUrl(state: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent',
  });
}
