import type { Task } from "@/types/domain";

export function buildSubmissionReadmeTemplate(task: Task | null) {
  if (!task) {
    return "";
  }

  return `# ${task.title}

## 1. 要件定義
- 解決したい業務課題:
- 想定利用者:
- 期待する業務効果:

## 2. 実装概要
- 課題の目的:
- 実装したもの:
- 利用した技術:

## 3. 機能要件への対応
${task.acceptanceCriteria.mustHave.map((item) => `- ${item}`).join("\n")}

## 4. 設計
- データの流れ:
- 画面または処理の構成:
- 工夫した設計判断:

## 5. エラーハンドリング
${task.acceptanceCriteria.minimumErrorHandling.map((item) => `- ${item}`).join("\n")}

## 6. モック画像 / 画面イメージ
- 添付した画像の説明:
- どの状態を見せているか:

## 7. 提出物チェック
${task.acceptanceCriteria.requiredSubmissionItems.map((item) => `- ${item}`).join("\n")}

## 8. 実行手順
- 

## 9. ビジネス価値
- 

## 10. 今後の改善点
- `;
}
