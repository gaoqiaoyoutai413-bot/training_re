import { createSign } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

type ExportTarget = "requirements" | "design" | "brief";

type GoogleAccessTokenResponse = {
  access_token: string;
};

type DocLine =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; text: string }
  | { kind: "blank" };

type RangeStyle =
  | { kind: "heading"; level: 1 | 2 | 3; start: number; end: number }
  | { kind: "bullet"; start: number; end: number }
  | { kind: "code"; start: number; end: number };

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DOCS_BASE_URL = "https://docs.googleapis.com/v1/documents";

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getGoogleServiceAccountConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    return null;
  }

  return {
    clientEmail,
    privateKey,
    folderId,
  };
}

async function getGoogleAccessToken() {
  const config = getGoogleServiceAccountConfig();

  if (!config) {
    throw new Error("Google Docs 連携用のサービスアカウント設定が不足しています。");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file",
    aud: GOOGLE_OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedJwt = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer.sign(config.privateKey, "base64url");
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const result = (await response.json()) as GoogleAccessTokenResponse & { error_description?: string };

  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description ?? "Google アクセストークンの取得に失敗しました。");
  }

  return result.access_token;
}

function parseMarkdownLines(markdown: string): DocLine[] {
  const rawLines = markdown.replace(/\r\n/g, "\n").split("\n");
  const lines: DocLine[] = [];
  let inCodeBlock = false;

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      lines.push({ kind: "blank" });
      continue;
    }

    if (inCodeBlock) {
      lines.push({ kind: "code", text: rawLine });
      continue;
    }

    if (/^###\s+/.test(line)) {
      lines.push({ kind: "heading", level: 3, text: line.replace(/^###\s+/, "") });
      continue;
    }

    if (/^##\s+/.test(line)) {
      lines.push({ kind: "heading", level: 2, text: line.replace(/^##\s+/, "") });
      continue;
    }

    if (/^#\s+/.test(line)) {
      lines.push({ kind: "heading", level: 1, text: line.replace(/^#\s+/, "") });
      continue;
    }

    if (/^\s*-\s+/.test(rawLine)) {
      lines.push({ kind: "bullet", text: rawLine.replace(/^\s*-\s+/, "") });
      continue;
    }

    if (!line) {
      lines.push({ kind: "blank" });
      continue;
    }

    lines.push({ kind: "paragraph", text: line.replace(/`/g, "") });
  }

  return lines;
}

function buildGoogleDocContent(lines: DocLine[]) {
  let text = "";
  let cursor = 1;
  const styles: RangeStyle[] = [];

  for (const line of lines) {
    if (line.kind === "blank") {
      text += "\n";
      cursor += 1;
      continue;
    }

    const content = `${line.text}\n`;
    const start = cursor;
    const end = cursor + content.length - 1;
    text += content;
    cursor += content.length;

    if (line.kind === "heading") {
      styles.push({ kind: "heading", level: line.level, start, end });
    } else if (line.kind === "bullet") {
      styles.push({ kind: "bullet", start, end });
    } else if (line.kind === "code") {
      styles.push({ kind: "code", start, end });
    }
  }

  return { text, styles };
}

function toNamedStyleType(level: 1 | 2 | 3) {
  if (level === 1) return "HEADING_1";
  if (level === 2) return "HEADING_2";
  return "HEADING_3";
}

function buildDocumentTitle(target: ExportTarget) {
  if (target === "requirements") return "Tech-Quest 要件定義書";
  if (target === "design") return "Tech-Quest 設計書";
  return "Tech-Quest 社内説明用サマリー";
}

async function createGoogleDocument(title: string, accessToken: string, folderId?: string) {
  const response = await fetch(GOOGLE_DRIVE_FILES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: title,
      mimeType: "application/vnd.google-apps.document",
      parents: folderId ? [folderId] : undefined,
    }),
  });

  const result = (await response.json()) as { id?: string; webViewLink?: string; error?: { message?: string } };

  if (!response.ok || !result.id) {
    throw new Error(result.error?.message ?? "Google ドキュメントの作成に失敗しました。");
  }

  return result.id;
}

async function writeDocumentContent(documentId: string, target: ExportTarget, markdown: string, accessToken: string) {
  const parsedLines = parseMarkdownLines(markdown);
  const { text, styles } = buildGoogleDocContent(parsedLines);
  const title = buildDocumentTitle(target);
  const generatedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const preface = `${title}\n出力日: ${generatedDate}\n\n`;
  const requests: Array<Record<string, unknown>> = [
    {
      insertText: {
        location: { index: 1 },
        text: `${preface}${text}`,
      },
    },
  ];

  requests.push({
    updateParagraphStyle: {
      range: {
        startIndex: 1,
        endIndex: title.length + 1,
      },
      paragraphStyle: {
        namedStyleType: "TITLE",
        spaceBelow: { magnitude: 8, unit: "PT" },
      },
      fields: "namedStyleType,spaceBelow",
    },
  });

  requests.push({
    updateTextStyle: {
      range: {
        startIndex: title.length + 1,
        endIndex: title.length + generatedDate.length + 7,
      },
      textStyle: {
        foregroundColor: {
          color: {
            rgbColor: {
              red: 0.45,
              green: 0.49,
              blue: 0.56,
            },
          },
        },
        fontSize: { magnitude: 10, unit: "PT" },
      },
      fields: "foregroundColor,fontSize",
    },
  });

  for (const style of styles) {
    const offsetStart = style.start + preface.length;
    const offsetEnd = style.end + preface.length;

    if (style.kind === "heading") {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: offsetStart,
            endIndex: offsetEnd,
          },
          paragraphStyle: {
            namedStyleType: toNamedStyleType(style.level),
            spaceAbove: { magnitude: style.level === 1 ? 14 : 10, unit: "PT" },
            spaceBelow: { magnitude: style.level === 1 ? 6 : 4, unit: "PT" },
          },
          fields: "namedStyleType,spaceAbove,spaceBelow",
        },
      });
      continue;
    }

    if (style.kind === "bullet") {
      requests.push({
        createParagraphBullets: {
          range: {
            startIndex: offsetStart,
            endIndex: offsetEnd,
          },
          bulletPreset: "BULLET_DISC_CIRCLE_SQUARE",
        },
      });
      continue;
    }

    if (style.kind === "code") {
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: offsetStart,
            endIndex: offsetEnd,
          },
          textStyle: {
            weightedFontFamily: {
              fontFamily: "Courier New",
            },
            backgroundColor: {
              color: {
                rgbColor: {
                  red: 0.96,
                  green: 0.96,
                  blue: 0.96,
                },
              },
            },
          },
          fields: "weightedFontFamily,backgroundColor",
        },
      });
    }
  }

  const response = await fetch(`${GOOGLE_DOCS_BASE_URL}/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests,
    }),
  });

  const result = (await response.json()) as { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Google ドキュメントへの書き込みに失敗しました。");
  }
}

async function getDocumentWebLink(documentId: string, accessToken: string) {
  const response = await fetch(`${GOOGLE_DRIVE_FILES_URL}/${documentId}?fields=webViewLink`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = (await response.json()) as { webViewLink?: string };
  return result.webViewLink ?? null;
}

function getTargetFilePath(target: ExportTarget) {
  if (target === "requirements") {
    return path.join(process.cwd(), "docs", "google-docs-requirements-spec.md");
  }

  if (target === "brief") {
    return path.join(process.cwd(), "docs", "internal-brief.md");
  }

  return path.join(process.cwd(), "docs", "google-docs-design-spec.md");
}

function getTargetTitle(target: ExportTarget) {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const suffix = `${yyyy}-${mm}-${dd}`;

  return target === "requirements"
    ? `Tech-Quest 要件定義書 ${suffix}`
    : target === "design"
      ? `Tech-Quest 設計書 ${suffix}`
      : `Tech-Quest 社内説明用サマリー ${suffix}`;
}

export async function exportMarkdownDocToGoogleDocs(target: ExportTarget) {
  const config = getGoogleServiceAccountConfig();

  if (!config) {
    throw new Error("Google Docs API 用の環境変数を設定してください。");
  }

  const markdown = await readFile(getTargetFilePath(target), "utf-8");
  const accessToken = await getGoogleAccessToken();
  const documentId = await createGoogleDocument(getTargetTitle(target), accessToken, config.folderId);
  await writeDocumentContent(documentId, target, markdown, accessToken);
  const webViewLink = await getDocumentWebLink(documentId, accessToken);

  return {
    documentId,
    webViewLink,
  };
}
