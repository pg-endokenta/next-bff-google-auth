# セットアップ手順

## 前提
- Node.js 18+
- Google Cloud Console で OAuth クライアントが作成できる権限

## Google OAuth クライアントの設定
1. 「認証情報」から OAuth 2.0 クライアントID（アプリケーションの種類: ウェブアプリケーション）を作成する。
2. 承認済みリダイレクト URI に以下を追加する。
   - ローカル開発: `http://localhost:3000/api/auth/callback`
   - GitHub Codespaces: `https://<your-codespace>-3000.app.github.dev/api/auth/callback` （ポート番号は付けない）

## 環境変数の準備
プロジェクト直下に `.env.local` を作成し、以下を設定する。

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback   # Codespaces では転送 URL に置き換える
SESSION_SECRET=長くて複雑なランダム文字列
```

## 実行
```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000/`（Codespaces なら転送された URL）にアクセスして、Google ログインを実行する。

## よくある設定ミス
- Google Console のリダイレクト URI と `.env.local` の `GOOGLE_REDIRECT_URI` が一致していない
- Codespaces でリダイレクト URI に `:3000` を付けてしまい、`app.github.dev:3000` へ飛んでしまう
