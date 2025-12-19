'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type SessionUser = {
  email?: string;
  name?: string;
  picture?: string;
};

type SessionResponse = {
  authenticated: boolean;
  user?: SessionUser | null;
  message?: string;
};

export default function Home() {
  const [session, setSession] = useState<SessionResponse>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSession(data);
      } catch (error) {
        setSession({ authenticated: false, message: 'セッション情報の取得に失敗しました' });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ authenticated: false });
  };

  return (
    <main>
      <section className="card">
        <header className="card__header">
          <div>
            <p className="badge">Next.js + BFF</p>
            <h1 className="card__title">Googleログインデモ</h1>
            <p className="muted">シークレットをブラウザに持たせないBFF構成のログインフロー</p>
          </div>
          <div
            className={`card__status ${session.authenticated ? 'card__status--ok' : 'card__status--warn'}`}
            aria-live="polite"
          >
            {session.authenticated ? 'ログイン済み' : '未ログイン'}
          </div>
        </header>

        <div className="card__body">
          {session.authenticated && session.user ? (
            <div className="user-row">
              {session.user.picture ? (
                <Image
                  src={session.user.picture}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="user-row__avatar"
                />
              ) : null}
              <div>
                <strong>{session.user.name ?? 'No name'}</strong>
                <p className="muted">{session.user.email}</p>
              </div>
            </div>
          ) : (
            <p className="muted">Googleログインでセッションを開始してください。</p>
          )}

          {session.message ? <p className="muted">{session.message}</p> : null}

          <div className="button-row">
            <button className="button button--primary" onClick={handleLogin} disabled={loading}>
              Googleでログイン
            </button>
            <button className="button button--ghost" onClick={handleLogout} disabled={!session.authenticated}>
              ログアウト
            </button>
          </div>

          <div className="info-box">
            <strong>セットアップ</strong>
            <p className="muted">.env.local に Google の Client ID / Secret、セッション用シークレットを設定してください。</p>
            <code>GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com</code>
            <code>GOOGLE_CLIENT_SECRET=xxxxx</code>
            <code>GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback</code>
            <code>SESSION_SECRET=長くて複雑なランダム文字列</code>
          </div>

          <div className="info-box">
            <strong>BFFで守るポイント</strong>
            <ul className="muted">
              <li>ブラウザからは Google のクライアントシークレットを参照できません。</li>
              <li>Googleとのトークン交換は Next.js Route Handler で実施します。</li>
              <li>署名付きのHTTP-only Cookieでセッションを管理します。</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
