# Cloudflare Workers へのデプロイ手順

このサイトは静的サイト（`astro build` で `dist/` に出力）のため、Cloudflare 用アダプターは使わず、`dist/` を Workers の静的アセットとして配信している。

- 公開URL: https://am-partners.maeda-faf.workers.dev
- 設定ファイル: `wrangler.jsonc`

## 初回セットアップ（実施済み）

### 1. Cloudflare アカウントの作成

https://dash.cloudflare.com/sign-up で登録する。

### 2. `wrangler.jsonc` の作成

プロジェクト直下に以下を置く。

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "am-partners",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

- `name`: Worker 名。workers.dev の URL の一部になる。
- `assets.directory`: ビルド出力先の `dist/` を配信する。
- `not_found_handling`: 存在しない URL には `dist/404.html` を返す。
- `trailingSlash: 'always'`（`astro.config.mjs`）は、アセットのデフォルト動作（`auto-trailing-slash`）で動作する。

### 3. `.gitignore` に `.wrangler/` を追加

`wrangler deploy` 実行時に生成される一時ディレクトリを Git 管理から外す。

### 4. Cloudflare へのログイン

```bash
npx wrangler login
```

ブラウザが開くので「Allow」を押す。

## デプロイ（更新のたびに実行）

```bash
npm run build && npx wrangler deploy
```

完了すると公開 URL とバージョン ID が表示される。

### 注意

初回デプロイ直後は、workers.dev の URL が反映されるまで数十秒ほど `Error code: 1042`（404）が返ることがある。少し待てば解消する。

## 今後の作業

### 独自ドメイン（am-partners.org）の設定

1. Cloudflare ダッシュボードの「Add a domain」で `am-partners.org` を追加し、レジストラ側でネームサーバーを Cloudflare 指定の値に変更する。
2. `wrangler.jsonc` に以下を追加して再デプロイする。

   ```jsonc
   "routes": [
     { "pattern": "am-partners.org", "custom_domain": true },
     { "pattern": "www.am-partners.org", "custom_domain": true }
   ]
   ```

   ダッシュボードの Workers → am-partners → Settings → Domains & Routes から追加してもよい。

### （任意）GitHub 連携による自動デプロイ

Workers → am-partners → Settings → Build で GitHub リポジトリを接続し、以下を設定する。

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

### （将来）SSR が必要になった場合

問い合わせフォームのサーバー処理などが必要になったら、`@astrojs/cloudflare` アダプターを導入する。
