import type { AnalyzePostResponse } from "@/types/analysis";

interface RewriteCardsProps {
  analysis: AnalyzePostResponse;
}

type RewriteKey = "saferVersion" | "confidentVersion" | "professionalVersion" | "funnyVersion";

const rewrites: Array<{ key: RewriteKey; title: string }> = [
  { key: "saferVersion", title: "Safer Version" },
  { key: "confidentVersion", title: "More Confident Version" },
  { key: "professionalVersion", title: "More Professional Version" },
  { key: "funnyVersion", title: "Funnier Version" },
];

export function RewriteCards({ analysis }: RewriteCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {rewrites.map((rewrite) => (
        <article key={rewrite.key} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h3 className="text-sm font-semibold text-mint">{rewrite.title}</h3>
          <p className="mt-3 leading-relaxed text-slate-100">{analysis[rewrite.key]}</p>
        </article>
      ))}
    </section>
  );
}
