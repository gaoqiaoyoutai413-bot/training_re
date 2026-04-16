import { NextResponse } from "next/server";
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
