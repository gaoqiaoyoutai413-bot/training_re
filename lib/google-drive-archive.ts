import { createSign } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

type DriveExportInput = {
  submissionId: string;
  taskCode: string;
  taskTitle: string | null;
  userName: string;
  submittedAt: string;
  readmeContent: string;
  sourceCodeUrl: string | null;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getGoogleDriveConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey || !rootFolderId) {
    return null;
  }

  return {
    clientEmail,
    privateKey,
    rootFolderId,
  };
}

function sanitizeDriveName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
}

function formatDriveDate(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

async function getGoogleAccessToken() {
  const config = getGoogleDriveConfig();

  if (!config) {
    throw new Error("Google Drive 連携用のサービスアカウント設定が不足しています。");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: "https://www.googleapis.com/auth/drive",
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

  const result = (await response.json()) as { access_token?: string; error_description?: string };

  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description ?? "Google Drive のアクセストークン取得に失敗しました。");
  }

  return result.access_token;
}

async function findFolderByName(accessToken: string, parentId: string, name: string) {
  const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and '${parentId}' in parents and name='${name.replace(/'/g, "\\'")}'`;
  const response = await fetch(
    `${GOOGLE_DRIVE_FILES_URL}?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const result = (await response.json()) as { files?: Array<{ id: string; name: string }> };
  return result.files?.[0] ?? null;
}

async function createFolder(accessToken: string, parentId: string, name: string) {
  const response = await fetch(GOOGLE_DRIVE_FILES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  const result = (await response.json()) as { id?: string; error?: { message?: string } };

  if (!response.ok || !result.id) {
    throw new Error(result.error?.message ?? "Google Drive フォルダの作成に失敗しました。");
  }

  return result.id;
}

async function findOrCreateFolder(accessToken: string, parentId: string, name: string) {
  const existing = await findFolderByName(accessToken, parentId, name);
  if (existing) {
    return existing.id;
  }
  return createFolder(accessToken, parentId, name);
}

async function uploadFileToDrive(accessToken: string, folderId: string, fileName: string, mimeType: string, body: Blob) {
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", body, fileName);

  const response = await fetch(`${GOOGLE_DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  const result = (await response.json()) as { id?: string; webViewLink?: string; error?: { message?: string } };

  if (!response.ok || !result.id) {
    throw new Error(result.error?.message ?? `Google Drive へのファイル保存に失敗しました: ${fileName}`);
  }

  return result;
}

export async function exportSubmissionToDrive(input: DriveExportInput) {
  const config = getGoogleDriveConfig();
  const supabase = createServerSupabaseClient();

  if (!config || !supabase) {
    throw new Error("Drive 退避に必要な設定が不足しています。");
  }

  const accessToken = await getGoogleAccessToken();
  const taskFolderName = sanitizeDriveName(`${input.taskCode}_${input.taskTitle ?? input.taskCode}`);
  const learnerFolderName = sanitizeDriveName(`${input.userName}_${formatDriveDate(input.submittedAt)}`);

  const taskFolderId = await findOrCreateFolder(accessToken, config.rootFolderId, taskFolderName);
  const learnerFolderId = await findOrCreateFolder(accessToken, taskFolderId, learnerFolderName);

  await uploadFileToDrive(
    accessToken,
    learnerFolderId,
    "README.md",
    "text/markdown",
    new Blob([input.readmeContent], { type: "text/markdown" }),
  );

  const { data: fileRows, error: fileError } = await supabase
    .from("submission_files")
    .select("storage_path, file_type, mime_type")
    .eq("submission_id", input.submissionId)
    .order("uploaded_at", { ascending: true });

  if (fileError) {
    throw new Error("提出ファイル一覧の取得に失敗しました。");
  }

  let mockIndex = 1;
  let codeIndex = 1;

  for (const file of fileRows ?? []) {
    const { data, error } = await supabase.storage.from("submission-evidence").download(file.storage_path);
    if (error || !data) {
      throw new Error(`Supabase Storage からファイルを取得できませんでした: ${file.storage_path}`);
    }

    const extension = file.storage_path.includes(".") ? file.storage_path.split(".").pop()?.toLowerCase() ?? "bin" : "bin";
    const fileName =
      file.file_type === "mock_image"
        ? `mock-${String(mockIndex++).padStart(2, "0")}.${extension}`
        : `code-${String(codeIndex++).padStart(2, "0")}.${extension}`;

    await uploadFileToDrive(accessToken, learnerFolderId, fileName, file.mime_type ?? data.type ?? "application/octet-stream", data);
  }

  if (input.sourceCodeUrl) {
    await uploadFileToDrive(
      accessToken,
      learnerFolderId,
      "code-link.txt",
      "text/plain",
      new Blob([input.sourceCodeUrl], { type: "text/plain" }),
    );
  }

  return {
    folderId: learnerFolderId,
    folderUrl: `https://drive.google.com/drive/folders/${learnerFolderId}`,
  };
}
