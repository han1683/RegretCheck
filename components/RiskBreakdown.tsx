import type { RiskScores } from "@/types/analysis";

interface RiskBreakdownProps {
  scores: RiskScores;
}

const riskLabels: Array<{ key: keyof RiskScores; label: string }> = [
  { key: "cringeRisk", label: "Cringe Risk" },
  { key: "employerRisk", label: "Employer Risk" },
  { key: "privacyRisk", label: "Privacy Risk" },
  { key: "brandRisk", label: "Brand Risk" },
  { key: "dramaRisk", label: "Drama Risk" },
  { key: "misunderstandingRisk", label: "Misunderstanding Risk" },
];

function getBarColor(score: number) {
  if (score >= 75) return "bg-coral";
  if (score >= 50) return "bg-lemon";
  return "bg-mint";
}

export function RiskBreakdown({ scores }: RiskBreakdownProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {riskLabels.map((risk) => {
        const score = scores[risk.key];

        return (
          <article key={risk.key} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-200">{risk.label}</h3>
              <span className="text-sm font-bold text-white">{score}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${getBarColor(score)}`} style={{ width: `${score}%` }} />
            </div>
          </article>
        );
      })}
    </section>
  );
}
