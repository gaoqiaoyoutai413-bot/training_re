import { NextResponse } from "next/server";
import { getDashboardMetricsForUser } from "@/lib/dashboard-repository";
import { getAuthorizedProfile } from "@/lib/server-auth";

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["student", "mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const metrics = await getDashboardMetricsForUser(authorized.profile.id);
  return NextResponse.json(metrics);
}
