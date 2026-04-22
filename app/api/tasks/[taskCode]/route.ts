import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { getTaskByTaskCode, updateTaskByTaskCode } from "@/lib/task-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskCode: string }> },
) {
  const { taskCode } = await params;
  const task = await getTaskByTaskCode(taskCode);

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskCode: string }> },
) {
  const authorized = await getAuthorizedProfile(request, ["admin"]);

  if (authorized.error) {
    return NextResponse.json({ message: authorized.error }, { status: authorized.status });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ message: "デモモードのため、課題編集は保存せず成功表示のみ返しています。" });
  }

  const { taskCode } = await params;
  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    learningObjective?: string;
    businessImpact?: string;
    background?: string;
    specificIssue?: string;
    finalGoal?: string;
    learnerActions?: string[];
    deliverables?: string[];
    businessValueChecks?: string[];
    starterKitTitle?: string;
    starterKitDescription?: string;
    starterKitSetupSteps?: string[];
    starterKitFiles?: Array<{ label?: string; path?: string; description?: string }>;
    acceptanceCriteria?: {
      mustHave?: string[];
      minimumErrorHandling?: string[];
      requiredSubmissionItems?: string[];
    };
    aiReviewRubric?: Array<{ title?: string; description?: string }>;
  };

  const result = await updateTaskByTaskCode(taskCode, {
    title: String(body.title ?? "").trim(),
    summary: String(body.summary ?? "").trim(),
    learningObjective: String(body.learningObjective ?? "").trim(),
    businessImpact: String(body.businessImpact ?? "").trim(),
    background: String(body.background ?? "").trim(),
    specificIssue: String(body.specificIssue ?? "").trim(),
    finalGoal: String(body.finalGoal ?? "").trim(),
    learnerActions: Array.isArray(body.learnerActions) ? body.learnerActions : [],
    deliverables: Array.isArray(body.deliverables) ? body.deliverables : [],
    businessValueChecks: Array.isArray(body.businessValueChecks) ? body.businessValueChecks : [],
    starterKitTitle: String(body.starterKitTitle ?? "").trim(),
    starterKitDescription: String(body.starterKitDescription ?? "").trim(),
    starterKitSetupSteps: Array.isArray(body.starterKitSetupSteps) ? body.starterKitSetupSteps : [],
    starterKitFiles: Array.isArray(body.starterKitFiles)
      ? body.starterKitFiles.flatMap((item) => {
          if (
            typeof item?.label !== "string" ||
            typeof item?.path !== "string" ||
            typeof item?.description !== "string"
          ) {
            return [];
          }

          return [
            {
              label: item.label.trim(),
              path: item.path.trim(),
              description: item.description.trim(),
            },
          ];
        })
      : [],
    acceptanceCriteria: {
      mustHave: Array.isArray(body.acceptanceCriteria?.mustHave) ? body.acceptanceCriteria.mustHave : [],
      minimumErrorHandling: Array.isArray(body.acceptanceCriteria?.minimumErrorHandling)
        ? body.acceptanceCriteria.minimumErrorHandling
        : [],
      requiredSubmissionItems: Array.isArray(body.acceptanceCriteria?.requiredSubmissionItems)
        ? body.acceptanceCriteria.requiredSubmissionItems
        : [],
    },
    aiReviewRubric: Array.isArray(body.aiReviewRubric)
      ? body.aiReviewRubric.flatMap((item) => {
          if (typeof item?.title !== "string" || typeof item?.description !== "string") {
            return [];
          }
          return [{ title: item.title, description: item.description }];
        })
      : [],
  });

  if (result.error) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: "課題を更新しました。" });
}
