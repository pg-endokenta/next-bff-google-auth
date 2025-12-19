# next-bff-google-auth

Next.js (App Router) で BFF 経由の Google ログインを実装するサンプルです。ブラウザからはクライアントシークレットを参照できず、トークン交換は Route Handler で完結します。

## セットアップ

1. Google Cloud Console で OAuth クライアントを発行し、承認済みリダイレクト URI に `http://localhost:3000/api/auth/callback` を追加します。
2. `.env.local` を作成し、`.env.example` を参考に以下を設定します。

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=ランダムで長い文字列
```

3. 依存関係をインストールして起動します。

```bash
npm install
npm run dev
```

## テスト・ビルドを実行できない場合の対処

依存関係のインストールが 403 などで失敗する環境では、テストや lint も実行できません。以下を試してください。

1. npm がアクセスできるレジストリを設定する

   - 一時的に環境変数で上書きする場合

     ```bash
     NPM_CONFIG_REGISTRY=https://registry.npmjs.org npm install
     ```

   - プロジェクトローカルに `.npmrc` を置く場合

     ```
     echo "registry=https://registry.npmjs.org" > .npmrc
     npm install
     ```

2. プロキシが必要な場合は `HTTPS_PROXY` / `HTTP_PROXY` を設定する。

3. レジストリへの疎通を確認する。

   ```bash
   npm ping --registry https://registry.npmjs.org
   ```

上記で依存関係が取得できれば、`npm run lint` や必要なテストコマンドを実行できます。

## 仕組み

- `/api/auth/login` で state を発行し、Google の認可画面へ 302 リダイレクトします。
- `/api/auth/callback` で code/state を検証し、ID トークンを Google から取得。署名付き JWT を HTTP-only Cookie に保存してセッションを開始します。
- `/api/auth/session` でブラウザからセッション状態を確認できます。
- `/api/auth/logout` でセッション Cookie を破棄します。

フロントエンド (`src/app/page.tsx`) では、API 経由でセッションを確認し、ログインボタンを押すと BFF が認可フローへ遷移させます。
