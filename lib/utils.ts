export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDifficulty(level: number) {
  return "★".repeat(level) + "☆".repeat(Math.max(0, 4 - level));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatTaskCategory(category: string) {
  const labels: Record<string, string> = {
    internal_ops: "社内業務効率化",
    customer_engagement: "顧客接点強化",
    knowledge_management: "ナレッジマネジメント",
    data_optimization: "データ分析・最適化",
  };

  return labels[category] ?? category;
}
