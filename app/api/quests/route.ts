import { NextResponse } from "next/server";
import { getTasks } from "@/lib/task-repository";

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json({ items: tasks });
}
