# API リファレンス草案

## 1. 認証

認証は原則 Supabase Auth を利用し、アプリ側 API はログイン済みセッション前提です。

## 2. Student API

### `GET /api/quests`

課題一覧を取得します。

#### Query

- `category`
- `difficulty`
- `status`
- `recommended_for`

#### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "taskCode": "TASK-01",
      "version": 2,
      "title": "Slack 通知自動化",
      "difficulty": 2,
      "category": "automation",
      "recommendedDependencies": [
        {
          "taskCode": "TASK-00",
          "reason": "API 基礎"
        }
      ]
    }
  ]
}
```

### `GET /api/dashboard/me`

ログインユーザーの進捗、スキルスコア、提出履歴を取得します。

### `POST /api/submissions`

提出を作成します。

#### Request

```json
{
  "taskId": "uuid",
  "businessValueText": "# README\n\n実装概要...",
  "files": [
    {
      "storagePath": "submissions/xxx/mockup/screen-01.png",
      "fileType": "mock_image"
    }
  ]
}
```

#### Behavior

- submission を保存
- README を主提出物として扱う
- モック画像を必須保存する
- AI レビュージョブを作成
- Slack 通知イベントを発行

### `GET /api/submissions/:id`

自身の提出詳細を取得します。

## 3. Mentor API

### `GET /api/reviews`

レビュー対象提出一覧を取得します。

#### Query

- `batchId`
- `status`
- `taskId`
- `assignedToMe`

### `GET /api/reviews/:submissionId`

提出内容、AI レビュー結果、過去提出履歴を取得します。

### `POST /api/reviews/:submissionId`

メンター評価を登録します。

#### Request

```json
{
  "technicalScore": 82,
  "businessScore": 76,
  "comment": "認証周りは堅牢ですが、業務影響の定量化を補強するとより良いです",
  "result": "passed"
}
```

## 4. Admin API

### `GET /api/batches`

バッチ一覧と進捗概要を返します。

### `POST /api/batches`

バッチを新規作成します。

### `GET /api/tasks`

課題定義一覧を返します。

### `POST /api/tasks`

課題定義を新規作成します。

### `POST /api/tasks/:taskCode/version`

既存課題の新バージョンを発行します。

## 5. Webhook / Job API

### `POST /api/jobs/ai-review/run`

AI レビュージョブを処理します。

### `POST /api/jobs/slack-notify/run`

未送信通知を送信します。

## 6. エラーハンドリング方針

- `400`: バリデーションエラー
- `401`: 未認証
- `403`: 権限なし
- `404`: 対象なし
- `409`: 二重レビューや状態競合
- `500`: 想定外エラー

## 7. API 設計の補足

- ファイルアップロードは Storage への署名 URL 方式を推奨
- 集計系は API 内で都度集計せず View を参照
- AI レビューは同期レスポンスに含めず、ポーリングまたはリアルタイム更新で反映
