import type { AnalyzePostResponse } from "@/types/analysis";
import { RecommendationBadge } from "./RecommendationBadge";

interface ScoreCardProps {
  analysis: AnalyzePostResponse;
}

function getScoreColor(score: number) {
  if (score >= 82) return "text-coral";
  if (score >= 60) return "text-lemon";
  if (score >= 35) return "text-amber-200";
  return "text-mint";
}

export function ScoreCard({ analysis }: ScoreCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-glow backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-smoke">Regret Score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className={`text-7xl font-black leading-none ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </span>
            <span className="pb-2 text-2xl font-semibold text-slate-400">/100</span>
          </div>
        </div>
        <RecommendationBadge recommendation={analysis.recommendation} riskLevel={analysis.riskLevel} />
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-semibold text-slate-300">Main concern</p>
        <p className="mt-2 text-lg leading-relaxed text-white">{analysis.mainConcern}</p>
      </div>
    </section>
  );
}
