# 認可フローのざっくり解説（会話まとめ）

## /api/auth/login
- `GET` で呼ぶと `state`（CSRF防止のランダム値）を発行し、Cookie に保存（httpOnly, SameSite=Lax）。
- `buildGoogleAuthUrl(state)` で `state` をクエリに含めた Google 認可 URL を生成し、302 リダイレクト。
- ここではまだセッションを作らない。目的は Google の認可画面へ送ることだけ。

## state とは？ 認可 URL に含める理由
- 攻撃者による別リダイレクト先への差し替えを防ぐためのワンタイム値。
- フロー前半で発行し Cookie に保存。Google から戻るときに同じ値をクエリ `state` で返してもらい、後半で照合することで CSRF を防ぐ。

## /api/auth/callback
- Google が `code` と `state` を付けて戻してくる。
- まず Cookie に保存した `state` と照合し、不一致なら 400（CSRF 防止）。
- 一致したら `client.getToken({ code, redirect_uri: GOOGLE_REDIRECT_URI })` でトークン交換し、ID トークンを取得。
- `client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })` で署名・aud・有効期限を検証し、`sub`/`email` などを取り出す。
- `sub`/`email` を必須とし、プロフィールをセッション用 JWT に詰めて httpOnly Cookie に保存。
- アプリのトップ（または `returnTo`）へ 302 リダイレクト。

## セッション Cookie の性質
- 署名付き JWT（HS256, `SESSION_SECRET`）。有効期限 7 日。
- `httpOnly: true`（JS から読めない）、`sameSite: 'lax'`、本番は `secure: true`。
- 保存先パス `/`。

## /api/auth/session
- Cookie の JWT を検証して、ログイン済みなら `{ authenticated: true, user: { email, name, picture } }` を返す。
- 未ログインまたは検証失敗なら `{ authenticated: false }` を返す。

## /api/auth/logout
- セッション Cookie を削除するだけのエンドポイント。
