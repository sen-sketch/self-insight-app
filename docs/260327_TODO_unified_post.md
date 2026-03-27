# TODO: 統合投稿リファクタリング

## 前提決定事項

| 項目 | 決定内容 |
|---|---|
| 既存データ | 統合型 `Post` に移行（習慣タスクでカテゴリ分け） |
| タグ（習慣） | 習慣タスク一覧から選択（`habitId` 参照） |
| 画像添付 | 今回スコープ外 |
| ホーム「今日の記録」 | 統合投稿リストを表示 |

---

## Phase 0: ブランチ準備

- [x] `style/ui-overhaul` → `main` にマージ
- [x] `feat/unified-post` ブランチを切る

---

## Phase 1: 型定義の統合 (`src/lib/types.ts`)

- [x] `Post` 型を新設（下記フィールド）
  - `id`, `userId`, `postedAt`（デフォルト現在時刻・変更可）
  - `moodScore: MoodScore | null`（任意）
  - `whatText: string | null`（何をしたか・任意）
  - `resultText: string | null`（結果・気づき・任意）
  - `questionText: string | null`（疑問と考察・任意）
  - `habitTags: string[]`（`Habit.id` の配列）
  - `freeTags: string[]`（自由記載タグ）
  - `createdAt`, `updatedAt`
- [x] `CreatePostInput` 型を新設
- [x] `UpdatePostInput` 型を新設
- [x] 旧型（`TimelinePost`, `LuckRecord`, `MetaDiary`）は移行完了後に削除

---

## Phase 2: ストレージ層の統合 (`src/storage/index.ts`)

- [x] `KEYS.posts = "sia:posts"` を追加
- [x] `getPosts()` を実装
- [x] `addPost(draft: CreatePostInput)` を実装
- [x] `updatePost(id, patch: UpdatePostInput)` を実装
- [x] `deletePost(id)` を実装
- [x] バリデーション関数 `validatePostInput` を `src/lib/validation.ts` に追加

---

## Phase 3: データマイグレーション (`src/lib/migration.ts`)

- [x] 既存 localStorage データを `Post` 形式に変換する関数を作成
  - `TimelinePost` → `Post`（`content` → `whatText`、`tags` → `freeTags`）
  - `LuckRecord` → `Post`（`challengeText` → `whatText`、`emotionText` → `resultText`、`insightText` → `questionText`）
  - `MetaDiary` → `Post`（`goalText` + `actualText` を `whatText` に結合、`tomorrowPlanText` → `questionText`）
  - `HabitStartLog` → `Post`（`habitId` → `habitTags`、`note` → `whatText`）
- [x] アプリ初回起動時に一度だけ移行を実行する仕組みを実装（`sia:migrated_v2` フラグ）
- [x] 移行後も旧キーのデータは保持（しばらくバックアップとして残す）

---

## Phase 4: 統合投稿フォーム (`src/components/post/`)

- [x] `UnifiedPostForm.tsx` を新設
  - 気分スコア選択（任意、デフォルト未選択）
  - 「何をしたか」テキスト（任意）
  - 「結果・気づき」テキスト（任意）
  - 「疑問と考察」テキスト（任意）
  - 習慣タスクボタン（`getHabits()` から取得、複数選択可）
  - 自由タグ入力
  - 日時ピッカー（デフォルト現在時刻、変更可）
  - 送信ボタン
- [x] `PostCard.tsx` を新設（統合投稿の1件表示）
- [x] `PostList.tsx` を新設（投稿一覧表示）

---

## Phase 5: ナビゲーション再構成

現在のナビ構成（6タブ）→ 新構成（5タブ）

| 現在 | 新 |
|---|---|
| ホーム | ホーム |
| タイムライン | タイムライン |
| 習慣 / 運 / 日記（3タブ） | 投稿（+ボタン or タブ） |
| エクスポート | 設定 |
| ─ | 出力 |

- [x] `src/components/layout/BottomNav.tsx` を更新（5タブ構成）
- [x] `app/post/page.tsx` を新設（統合投稿フォームページ）
- [x] `app/settings/page.tsx` を新設（習慣タスク設定 + 出力カスタム）

---

## Phase 6: ホーム画面の更新 (`src/app/page.tsx`)

- [x] 「今日の習慣トラッカー」セクションを維持（`HabitList` 流用）
- [x] 「今日の記録」セクションを追加（当日の `Post` 一覧を `PostList` で表示）
- [x] 習慣の開始記録ボタン → `addPost` に統合（`habitTags` に該当タスクをセット）

---

## Phase 7: タイムライン画面の更新

- [x] `src/app/timeline/page.tsx` → `getPosts()` を参照するよう変更
- [x] `TimelinePostForm.tsx` を `UnifiedPostForm` に差し替え
- [x] `TimelinePostCard.tsx` を `PostCard` に差し替え
- [x] フィルタ・ソート機能は維持

---

## Phase 8: 設定画面の新設 (`src/app/settings/`)

- [x] 習慣タスク管理（現 `tracker` ページの設定部分を移植）
- [x] 出力文カスタム設定（出力テンプレートの調整、将来拡張用のプレースホルダーでもOK）

---

## Phase 9: 出力画面の更新 (`src/app/export/`)

- [x] `Post` 型から 1日/7日/30日 エクスポートできるよう `src/lib/export.ts` を更新
- [x] 旧カテゴリ別エクスポートボタンを統合形式に変更

---

## Phase 10: 旧コードの削除

移行・動作確認後に削除

- [x] `src/components/timeline/TimelinePostForm.tsx`
- [x] `src/components/luck/` ディレクトリ
- [x] `src/components/metadiary/` ディレクトリ
- [x] `src/app/luck/` ディレクトリ
- [x] `src/app/metadiary/` ディレクトリ
- [x] `src/lib/types.ts` から旧型定義を削除
- [x] `src/storage/index.ts` から旧CRUD関数を削除

---

## 実装順序の目安

```
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
```

Phase 3（マイグレーション）は Phase 2 完了後に先行着手すると、
既存データを失わずに並行開発しやすい。
