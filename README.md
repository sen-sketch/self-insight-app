# 自己観察Webアプリ（self-insight-app）

日々の思考・感情・行動を記録し、振り返りとLLMへのエクスポートを支援するスマホ向けWebアプリ。

## 概要

- 単一ユーザー前提のパーソナルな記録ツール
- データはブラウザのlocalStorageに保存（サーバ送信なし）
- LLMに貼り付けられる形式でエクスポート可能

## 画面構成

| 画面 | パス | 概要 |
|------|------|------|
| S01 ダッシュボード | `/` | 各記録のサマリー |
| S02 タイムライン | `/timeline` | 投稿の一覧・フィルタ |
| S03 習慣トラッカー | `/tracker` | 習慣タスクの管理と開始記録 |
| S04 投稿 | `/post` | タイムライン・運記録・メタ認知日記の入力 |
| S05 エクスポート | `/export` | 1日/7日/30日のテキスト生成 |
| 設定 | `/settings` | アプリ設定 |

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **アイコン**: lucide-react
- **データ保存**: localStorage（`storage/` 層経由）

## ディレクトリ構成

```
src/
├── app/          # Next.js App Router ページ
├── components/   # 画面単位・UI部品
│   ├── dashboard/
│   ├── export/
│   ├── habit/
│   ├── layout/
│   ├── post/
│   ├── settings/
│   └── timeline/
├── lib/          # 集計・エクスポート・型・バリデーション・日付処理
└── storage/      # ローカル保存（将来のDB切替点）
```

## 開発環境のセットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動する。

## その他コマンド

```bash
npm run build   # 本番ビルド
npm run lint    # ESLint
```

## データについて

- すべてのデータはブラウザの `localStorage` に保存される
- サーバへの送信は一切行わない
- ブラウザのデータをクリアするとデータが消えるため、エクスポート機能でバックアップを推奨
