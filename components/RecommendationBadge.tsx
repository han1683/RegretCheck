import type { Recommendation, RiskLevel } from "@/types/analysis";

interface RecommendationBadgeProps {
  recommendation: Recommendation;
  riskLevel?: RiskLevel;
}

const recommendationStyles: Record<Recommendation, string> = {
  "Post it": "border-mint/40 bg-mint/15 text-mint",
  "Edit first": "border-lemon/40 bg-lemon/15 text-lemon",
  "Do not post": "border-coral/40 bg-coral/15 text-coral",
};

export function RecommendationBadge({ recommendation, riskLevel }: RecommendationBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${recommendationStyles[recommendation]}`}
      >
        {recommendation}
      </span>
      {riskLevel ? <span className="text-sm text-smoke">Risk level: {riskLevel}</span> : null}
    </div>
  );
}
