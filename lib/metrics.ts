import type { SkillScores, Task } from "@/types/domain";

export function topSkills(scores: SkillScores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }));
}

export function taskSkillTotal(task: Task) {
  return Object.values(task.skills).reduce((sum, value) => sum + value, 0);
}
