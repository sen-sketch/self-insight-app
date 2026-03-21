# DB設計（MVP）

## 1. 方針
- RDB想定: PostgreSQL
- 初期は単一ユーザー運用だが、将来の複数ユーザー化に備え `user_id` を保持する。
- 日時は `timestamptz`、日単位データは `date` を使用する。

## 2. テーブル定義

## users
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | ユーザーID |
| display_name | text | No | 表示名 |
| created_at | timestamptz | Yes | 作成日時 |
| updated_at | timestamptz | Yes | 更新日時 |

## timeline_posts
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | 投稿ID |
| user_id | uuid (FK users.id) | Yes | ユーザーID |
| posted_at | timestamptz | Yes | 投稿日時 |
| mood_score | smallint | Yes | 気分スコア(1-5) |
| content | text | Yes | 本文 |
| tags | text[] | No | タグ配列 |
| created_at | timestamptz | Yes | 作成日時 |
| updated_at | timestamptz | Yes | 更新日時 |

制約:
- `mood_score BETWEEN 1 AND 5`

インデックス:
- `(user_id, posted_at DESC)`
- `GIN(tags)`

## habits
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | 習慣タスクID |
| user_id | uuid (FK users.id) | Yes | ユーザーID |
| name | text | Yes | タスク名 |
| target_start_time | time | No | 目標開始時刻 |
| is_active | boolean | Yes | 有効フラグ |
| created_at | timestamptz | Yes | 作成日時 |
| updated_at | timestamptz | Yes | 更新日時 |

インデックス:
- `(user_id, is_active, name)`

## habit_start_logs
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | 開始記録ID |
| user_id | uuid (FK users.id) | Yes | ユーザーID |
| habit_id | uuid (FK habits.id) | Yes | 習慣タスクID |
| started_at | timestamptz | Yes | 開始日時 |
| note | text | No | 補足メモ |
| created_at | timestamptz | Yes | 作成日時 |

インデックス:
- `(user_id, habit_id, started_at DESC)`
- `(user_id, started_at DESC)`

## luck_records
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | 記録ID |
| user_id | uuid (FK users.id) | Yes | ユーザーID |
| recorded_at | timestamptz | Yes | 記録日時 |
| challenge_text | text | Yes | 今日の小さな挑戦 |
| emotion_text | text | Yes | その時の感情 |
| insight_text | text | No | 気づき |
| next_action_text | text | No | 次回改善 |
| created_at | timestamptz | Yes | 作成日時 |
| updated_at | timestamptz | Yes | 更新日時 |

インデックス:
- `(user_id, recorded_at DESC)`

## metacognition_diaries
| カラム名 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | uuid (PK) | Yes | 日記ID |
| user_id | uuid (FK users.id) | Yes | ユーザーID |
| diary_date | date | Yes | 日記日付 |
| goal_text | text | Yes | 今日の目標 |
| actual_text | text | Yes | 実際やったこと |
| blocked_points_text | text | No | 詰まったポイント |
| tomorrow_plan_text | text | Yes | 明日やること |
| created_at | timestamptz | Yes | 作成日時 |
| updated_at | timestamptz | Yes | 更新日時 |

制約:
- `UNIQUE(user_id, diary_date)`（1日1件）

インデックス:
- `(user_id, diary_date DESC)`

## 3. ビュー/集計クエリ方針
### 3.1 習慣の週次平均開始時刻（例）
- 対象: 直近7日
- 算出: `started_at` をローカル時刻に変換し分単位で平均

### 3.2 前週比（例）
- 直近7日平均開始時刻と、その前7日平均を比較
- 差分がマイナスなら「早まった」と判定

### 3.3 エクスポート対象取得
- 期間開始日時を固定し、4テーブルから `user_id + 日時` で取得
- アプリ側でカテゴリごとに整形して1テキストに連結

## 4. データ保持と削除
- MVPは無期限保持
- 論理削除は未採用（必要時に `deleted_at` 追加）

## 5. セキュリティ方針（将来）
- 認証導入時は `user_id` ベースでRow Level Securityを適用
- エクスポートはログインユーザー自身のデータのみに限定
