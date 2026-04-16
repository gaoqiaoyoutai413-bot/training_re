type SlackNotifyPayload = {
  title: string;
  bodyLines: string[];
  channel?: string;
};

function getSlackConfig() {
  const botToken = process.env.SLACK_BOT_TOKEN?.trim();
  const reviewChannel = process.env.SLACK_REVIEW_CHANNEL?.trim();

  if (!botToken || !reviewChannel) {
    return null;
  }

  return { botToken, reviewChannel };
}

function buildText(payload: SlackNotifyPayload) {
  return [payload.title, ...payload.bodyLines].join("\n");
}

async function postMessageToSlack(channel: string, text: string, botToken: string) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text,
      mrkdwn: true,
    }),
  });

  const result = (await response.json()) as { ok?: boolean; error?: string };

  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? "Slack 通知に失敗しました。");
  }
}

async function openDirectMessageChannel(userSlackId: string, botToken: string) {
  const response = await fetch("https://slack.com/api/conversations.open", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      users: userSlackId,
    }),
  });

  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    channel?: { id?: string };
  };

  if (!response.ok || !result.ok || !result.channel?.id) {
    throw new Error(result.error ?? "Slack DM チャンネルの作成に失敗しました。");
  }

  return result.channel.id;
}

export async function sendSlackNotification(payload: SlackNotifyPayload) {
  const config = getSlackConfig();

  if (!config) {
    return { ok: false as const, skipped: true as const, reason: "Slack 設定が未入力です。" };
  }

  const channel = payload.channel ?? config.reviewChannel;
  const text = buildText(payload);
  await postMessageToSlack(channel, text, config.botToken);

  return { ok: true as const, skipped: false as const };
}

export async function sendSlackDirectMessage(userSlackId: string, payload: Omit<SlackNotifyPayload, "channel">) {
  const config = getSlackConfig();

  if (!config) {
    return { ok: false as const, skipped: true as const, reason: "Slack 設定が未入力です。" };
  }

  if (!userSlackId.trim()) {
    return { ok: false as const, skipped: true as const, reason: "Slack ID が未設定です。" };
  }

  const dmChannelId = await openDirectMessageChannel(userSlackId, config.botToken);
  await postMessageToSlack(dmChannelId, buildText(payload), config.botToken);

  return { ok: true as const, skipped: false as const };
}

export async function sendSubmissionCreatedSlackNotification(input: {
  taskCode: string;
  taskTitle?: string | null;
  learnerName: string;
  learnerEmail: string;
  submissionId: string;
}) {
  return sendSlackNotification({
    title: "新しい提出が登録されました",
    bodyLines: [
      `課題: ${input.taskTitle ?? input.taskCode} (${input.taskCode})`,
      `受講生: ${input.learnerName} / ${input.learnerEmail}`,
      `提出ID: ${input.submissionId}`,
      "メンターはレビュー管理から確認してください。",
    ],
  });
}

export async function sendAiReviewedSlackNotification(input: {
  taskCode: string;
  taskTitle?: string | null;
  learnerName: string;
  submissionId: string;
  summary: string;
}) {
  return sendSlackNotification({
    title: "AI一次レビューが完了しました",
    bodyLines: [
      `課題: ${input.taskTitle ?? input.taskCode} (${input.taskCode})`,
      `受講生: ${input.learnerName}`,
      `提出ID: ${input.submissionId}`,
      `要約: ${input.summary}`,
    ],
  });
}

export async function sendMentorReviewedSlackNotification(input: {
  taskCode: string;
  taskTitle?: string | null;
  learnerName: string;
  reviewerName: string;
  result: "passed" | "rework_requested";
  technicalScore: number;
  businessScore: number;
}) {
  const resultLabel = input.result === "passed" ? "合格" : "差し戻し";

  return sendSlackNotification({
    title: `メンター評価が登録されました: ${resultLabel}`,
    bodyLines: [
      `課題: ${input.taskTitle ?? input.taskCode} (${input.taskCode})`,
      `受講生: ${input.learnerName}`,
      `レビュー担当: ${input.reviewerName}`,
      `技術点: ${input.technicalScore} / 5`,
      `ビジネス点: ${input.businessScore} / 5`,
    ],
  });
}

export async function sendMentorReviewedDirectMessage(input: {
  userSlackId: string;
  taskCode: string;
  taskTitle?: string | null;
  reviewerName: string;
  result: "passed" | "rework_requested";
  technicalScore: number;
  businessScore: number;
}) {
  const resultLabel = input.result === "passed" ? "合格" : "差し戻し";

  return sendSlackDirectMessage(input.userSlackId, {
    title: `提出の評価が返却されました: ${resultLabel}`,
    bodyLines: [
      `課題: ${input.taskTitle ?? input.taskCode} (${input.taskCode})`,
      `レビュー担当: ${input.reviewerName}`,
      `技術点: ${input.technicalScore} / 5`,
      `ビジネス点: ${input.businessScore} / 5`,
      "詳細はシステムの提出状況から確認してください。",
    ],
  });
}
