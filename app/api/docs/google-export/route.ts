import { NextResponse } from "next/server";
import { exportMarkdownDocToGoogleDocs } from "@/lib/google-docs-export";
import { getAuthorizedProfile } from "@/lib/server-auth";

export async function POST(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["admin"]);

  if (authorized.error) {
    return NextResponse.json({ message: authorized.error }, { status: authorized.status });
  }

  const body = (await request.json()) as { target?: "requirements" | "design" };
  const target = body.target;

  if (target !== "requirements" && target !== "design") {
    return NextResponse.json({ message: "出力対象が不正です。" }, { status: 400 });
  }

  try {
    const result = await exportMarkdownDocToGoogleDocs(target);
    return NextResponse.json({
      message: "Google ドキュメントへ出力しました。",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Google ドキュメント出力に失敗しました。",
      },
      { status: 500 },
    );
  }
}
