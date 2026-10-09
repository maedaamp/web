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
| メール認証 | SPF・DKIM・DMARC（`p=none`）設定済み。詳細は「4. メール認証」を参照 |

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

## 4. メール認証（SPF・DKIM・DMARC）

`@am-partners.org` を名乗るなりすましメールを防ぎ、送信メールが迷惑メール扱いされにくくするための設定。

| 仕組み | 役割 | DNS レコード |
| --- | --- | --- |
| SPF | このドメインのメールを送ってよいサーバーを公開する | `am-partners.org` の TXT: `v=spf1 include:_spf.google.com -all` |
| DKIM | 送信メールに電子署名を付け、受信側が DNS の公開鍵で検証する | `google._domainkey` の TXT: `v=DKIM1; k=rsa; p=...` |
| DMARC | SPF・DKIM に失敗したメールの扱いを受信側に指示し、結果のレポートを受け取る | `_dmarc` の TXT: `v=DMARC1; p=none; rua=mailto:...@dmarc-reports.cloudflare.net` |

### DKIM（設定済み）

1. Google 管理コンソール（https://admin.google.com）→「アプリ」→「Google Workspace」→「Gmail」→「メールの認証」で、ドメイン `am-partners.org` を選ぶ。
2. 「新しいレコードを生成」で鍵を作る（2048 ビット、セレクタ `google`）。
3. 表示された値を、Cloudflare の DNS → Records に TXT（Name: `google._domainkey`）で登録する。255 文字を超える値もそのまま貼り付けてよい。
4. 反映後、管理コンソールで「認証を開始」を押す。ステータスが「DKIM でメールを認証しています」になれば完了。

設定後に「新しいレコードを生成」を押すと鍵が作り直され、DNS の登録もやり直しになる。「認証を停止」を押すと署名が止まる。

### DMARC（設定済み、`p=none`）

Cloudflare の「Email」→「DMARC Management」を有効にすると、`_dmarc` の TXT レコードが自動で追加される。レポートは Cloudflare が受け取り、同じ画面で集計を確認できる。最初のレポートは有効化から 24 時間ほどで届く。

DMARC Management 画面の表示の見方:

| 項目 | 表示 | 意味 |
| --- | --- | --- |
| DMARC policy | None（Warning） | `p=none` のため。段階的に厳しくする予定なので現時点では問題ない。 |
| SPF policy | Fail | SPF の末尾が `-all`（許可外の送信元は失敗扱い）であることを示しているとみられる。レコードは正しく公開されている。 |
| DKIM in use | Yes | 正常。 |
| BIMI in use | No（Fail） | 受信画面にロゴを表示する仕組み。DMARC の強制設定と有料証明書が必要なため、対応しない。 |

### 確認コマンド

```bash
dig +short TXT am-partners.org
dig +short TXT google._domainkey.am-partners.org
dig +short TXT _dmarc.am-partners.org
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

- **DMARC のポリシーを段階的に厳しくする**: DMARC Management のレポートを 2〜4 週間確認し、送信元が Google Workspace（と利用している正規サービス）だけで、いずれも SPF・DKIM に合格していれば、`_dmarc` の `p=none` を `p=quarantine` に変更する。しばらく様子を見て問題がなければ `p=reject` にする。
  - Google Workspace 以外に `@am-partners.org` で送信するサービス（問い合わせフォームの通知、メール配信サービスなど）を使う場合は、厳しくする前にそのサービスも SPF・DKIM に対応させる。対応していないと、そのメールが届かなくなる。
- **移管元アカウントの整理**: 個人アカウント（mdamtu@gmail.com）に `am-partners.org` のゾーンが残っていれば削除する。
