# 独自ドメイン（am-partners.org）の設定手順

Cloudflare Workers にデプロイしたサイト（`am-partners`）を `https://am-partners.org` で公開するための手順。デプロイ手順は [deploy.md](./deploy.md) を参照。

## 現在の構成（設定済み）

| 項目 | 内容 |
| --- | --- |
| レジストラ | Cloudflare Registrar |
| 管理アカウント | maeda@am-partners.org（アカウントID: `faf3b82f46e6488c251595e65f5285de`） |
| ネームサーバー | `jacqueline.ns.cloudflare.com` / `arturo.ns.cloudflare.com` |
| サイト | `https://am-partners.org`（Worker `am-partners` の Custom Domain） |
| www | `www.am-partners.org` → `https://am-partners.org` へ 301 リダイレクト |
| HTTP | Always Use HTTPS により HTTPS へ 301 リダイレクト |
| メール | Google Workspace（MX 5件、SPF・サイト確認用の TXT 2件） |

ドメイン・Worker・DNS はすべて同じアカウントにある必要がある。Worker に独自ドメインを割り当てられるのは、同じアカウント内のドメインだけ。

## 1. ドメインを別の Cloudflare アカウントへ移す

`am-partners.org` は当初、個人の Cloudflare アカウントで取得していたため、Worker のあるアカウントへ移した。同様の作業が必要になったときの手順。

参考: [Move a Cloudflare Registrar domain registration between accounts](https://developers.cloudflare.com/registrar/account-options/inter-account-transfer/)

### 条件

- ドメインの登録から 10 日以上経過していること
- 登録者のメールアドレスが確認済みであること
- DNSSEC が無効であること（移管元の DNS → 設定で確認）

### 手順

1. **移管元で DNS レコードを書き出す**: DNS → Records →「Export」。
2. **移管先にドメインを追加する**: ダッシュボードの「Add a domain」→「**Connect a domain**」（「Transfer a domain」は他社レジストラからの移管用なので使わない）。
   - Domain name にドメインを入力する。プランの選択は次の画面で Free を選ぶ。
   - 「Import DNS records」→「Upload a DNS zone file」で、1. で書き出したファイルを読み込む。SOA・NS は自動で無視される。
   - 取り込み後、レコードの件数と内容が移管元と一致するか確認する。
   - ネームサーバー変更の案内が出ても何もしない。ステータスは Pending や「Invalid nameservers」のままでよい。
3. **移管元で移動を申請する**: ドメイン → 登録 → 対象ドメイン → 概要の「クイック アクション」→「**別のアカウントに移動する**」。移管先のアカウントIDを入力する。
4. **移管先で承認する**: 届いたメール、またはドメインの登録画面から承認する。期限は 5 日で、過ぎると自動でキャンセルされる。
5. **ネームサーバーの切り替えを待つ**: 移管先のゾーンには別のネームサーバーが割り当てられる。ドメインの Overview で「ネームサーバーを確認」を押すと、Cloudflare が自動で切り替える（今回は 30 分以内に Active になった）。
   ```bash
   dig +short NS am-partners.org
   ```
   で移管先のネームサーバーが返れば完了。

### 注意

- 移したあと、移管元のゾーン設定は使えなくなる。DNS レコードは事前に移管先で作り直しておく。特に `MX` が抜けるとメールが届かなくなる。
- 移したあと 30 日間は他のレジストラへ移管できない。更新料は移管先のアカウントで支払う。

## 2. Worker に独自ドメインを割り当てる

事前に DNS → Records で、`am-partners.org` を指す `A`・`AAAA`・`CNAME` レコードがないことを確認する（あると割り当てが失敗する）。`MX`・`TXT` はそのままでよい。

`wrangler.jsonc` に `routes` を追加して再デプロイする。

```jsonc
"routes": [
  { "pattern": "am-partners.org", "custom_domain": true }
]
```

```bash
npm run build && npx wrangler deploy
```

DNS レコード（Type: Worker）と SSL 証明書は Cloudflare が自動で作成する。今回はデプロイ後すぐに HTTPS でアクセスできた。

```bash
curl -I https://am-partners.org/
```

`HTTP/2 200` が返れば完了。

### workers.dev の URL について

`routes` を設定すると、wrangler は workers.dev での公開（`https://am-partners.maeda-faf.workers.dev`）を自動で無効にする。`"workers_dev": false` を書く必要はない。workers.dev でも公開したい場合は `"workers_dev": true` を明示する。

## 3. www 付きの URL をリダイレクトする

サイトの正式な URL は `https://am-partners.org`（`astro.config.mjs` の `site`）なので、`www.am-partners.org` へのアクセスはそちらへ転送する。

1. **DNS レコードを追加する**: DNS → Records →「Add record」。リダイレクトを Cloudflare 上で処理するための受け口で、転送先のサーバーは不要。

   | Type | Name | IPv6 address | Proxy status |
   | --- | --- | --- | --- |
   | AAAA | www | `100::` | Proxied（オレンジ色の雲） |

2. **リダイレクトルールを作成する**: Rules →「Create rule」→ Redirect Rules で、テンプレート「Redirect from WWW to root」を選んで保存する。
   - 保存時に「This rule may not apply to your traffic」と警告が出ることがある。1. のレコードを追加済みなら「Ignore and deploy rule anyway」を選ぶ（「Create a new proxied DNS record」を選ぶとレコードが重複するおそれがある）。
3. **Always Use HTTPS をオンにする**: SSL/TLS → Edge Certificates →「Always Use HTTPS」。
   - テンプレートのルールは `https://www.*` だけが対象のため、これをオンにしないと `http://www.am-partners.org` が 522 エラーになる。
   - 画面にリダイレクトループの警告が出るが、Worker 側では HTTP→HTTPS の転送をしていないので問題ない。

### 動作確認

```bash
curl -sIL http://www.am-partners.org/about/ | grep -iE '^(HTTP|location)'
```

以下のように、最終的に `https://am-partners.org/about/` の 200 に到達すれば完了。

```
HTTP/1.1 301 Moved Permanently
Location: https://www.am-partners.org/about/
HTTP/2 301
location: https://am-partners.org/about/
HTTP/2 200
```

## うまくいかないとき

| 症状 | 主な原因と対処 |
| --- | --- |
| 独自ドメインの割り当てでエラーになる | 同じ名前の `A`・`AAAA`・`CNAME` レコードが残っている、またはドメインが Worker と別アカウントにある。 |
| HTTPS でアクセスすると証明書エラーになる | 証明書の発行待ち。数分〜十数分待ってから再度確認する。 |
| `http://www.` で 522 エラーになる | Always Use HTTPS がオフになっている。 |
| レコードを追加したのに `DNS_PROBE_FINISHED_NXDOMAIN` になる | 追加前に問い合わせた「存在しない」という結果が、手元の DNS サーバーに一時保存されている（最長 30 分）。待つか、`dig +short A www.am-partners.org @1.1.1.1` で Cloudflare の DNS から確認する。Mac のキャッシュは `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`、Chrome は `chrome://net-internals/#dns` で消せる。 |
| `www` 付きの URL が転送されない | `www` の DNS レコードが Proxied になっていない、またはリダイレクトルールが保存されていない。 |

## 今後の作業（任意）

- **DKIM・DMARC の設定**: 現在は SPF のみ。Google 管理コンソールで DKIM を有効にして `google._domainkey` の TXT レコードを追加し、`_dmarc` の TXT レコードも追加すると、なりすましメール対策になり、送信メールが迷惑メール扱いされにくくなる。
- **移管元アカウントの整理**: 個人アカウント（mdamtu@gmail.com）に `am-partners.org` のゾーンが残っていれば削除する。
