# 認可フローの流れ

1. `/api/auth/login`
   - `state` を生成し Cookie（httpOnly, SameSite=Lax）に保存
   - Google の認可 URL へ 302 リダイレクト
2. Google 認可画面
   - ユーザーが同意すると `code` と `state` を付けて `GOOGLE_REDIRECT_URI` に戻る
3. `/api/auth/callback`
   - `state` を Cookie と照合して CSRF を防止
   - `code` と `GOOGLE_REDIRECT_URI` でトークン交換
   - ID トークンの `sub` と `email` を検証し、セッション用 JWT を生成
   - 署名付き JWT を httpOnly Cookie にセットし、アプリのトップへリダイレクト
4. `/api/auth/session`
   - Cookie からセッション JWT を検証し、ユーザー情報を返す
5. `/api/auth/logout`
   - セッション Cookie を削除

### 守っているポイント
- クライアントシークレットはサーバー側にのみ保持
- トークン交換は BFF（Route Handler）で完結
- セッションは署名付き httpOnly Cookie で管理
