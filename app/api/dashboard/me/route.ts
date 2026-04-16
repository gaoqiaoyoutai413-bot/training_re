import { NextResponse } from "next/server";
import { studentDashboard } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(studentDashboard);
}
