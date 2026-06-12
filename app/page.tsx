"use client";

import { useState } from "react";
import { ImageCheckerForm } from "@/components/ImageCheckerForm";
import { LoadingState } from "@/components/LoadingState";
import { PostCheckerForm } from "@/components/PostCheckerForm";
import { RecommendationBadge } from "@/components/RecommendationBadge";
import { RewriteCards } from "@/components/RewriteCards";
import { RiskBreakdown } from "@/components/RiskBreakdown";
import { ScoreCard } from "@/components/ScoreCard";
import { VideoComingSoon } from "@/components/VideoComingSoon";
import type { AnalyzePostResponse } from "@/types/analysis";

type CheckerMode = "text" | "image" | "video";

const checkerModes: Array<{ id: CheckerMode; label: string; eyebrow: string }> = [
  { id: "text", label: "Text", eyebrow: "Caption" },
  { id: "image", label: "Image", eyebrow: "Screenshot" },
  { id: "video", label: "Video", eyebrow: "Beta" },
];

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalyzePostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkerMode, setCheckerMode] = useState<CheckerMode>("text");

  function handleModeChange(nextMode: CheckerMode) {
    setCheckerMode(nextMode);
    setAnalysis(null);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint font-black text-ink">R</div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">RegretCheck</p>
              <p className="text-xs text-smoke">Caption confidence check</p>
            </div>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-smoke sm:block">
            MVP demo
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="pt-4 lg:sticky lg:top-6">
            <p className="mb-4 inline-flex rounded-full border border-mint/25 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint">
              Pre-post clarity for creators
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Would you regret posting this?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Paste your caption or upload a screenshot before it goes live. RegretCheck shows how it could be perceived
              and gives you a safer version.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Tone scan", "Image check", "Cleaner rewrites"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2">
              {checkerModes.map((mode) => {
                const isSelected = mode.id === checkerMode;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    className={`rounded-2xl px-3 py-3 text-left transition ${
                      isSelected ? "bg-mint text-ink" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-[0.16em] opacity-70">{mode.eyebrow}</span>
                    <span className="mt-1 block text-base font-black">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {checkerMode === "text" ? <PostCheckerForm onResult={setAnalysis} onLoadingChange={setIsLoading} /> : null}
            {checkerMode === "image" ? <ImageCheckerForm onResult={setAnalysis} onLoadingChange={setIsLoading} /> : null}
            {checkerMode === "video" ? <VideoComingSoon /> : null}
          </div>
        </section>

        <section className="space-y-5" aria-live="polite">
          {isLoading ? <LoadingState /> : null}

          {!isLoading && analysis ? (
            <div className="space-y-5">
              <ScoreCard analysis={analysis} />

              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-black text-white">Risk breakdown</h2>
                  <p className="hidden text-sm text-smoke sm:block">Higher numbers mean higher chance of side-eye.</p>
                </div>
                <RiskBreakdown scores={analysis.scores} />
              </div>

              <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
                <h2 className="text-2xl font-black text-white">Why you might regret it</h2>
                <ul className="mt-4 space-y-3">
                  {analysis.whyYouMightRegretIt.map((reason) => (
                    <li key={reason} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-200">
                      {reason}
                    </li>
                  ))}
                </ul>
              </section>

              <div>
                <h2 className="mb-3 text-2xl font-black text-white">Rewrites</h2>
                <RewriteCards analysis={analysis} />
              </div>

              <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-smoke">Final recommendation</p>
                <RecommendationBadge recommendation={analysis.recommendation} />
              </section>
            </div>
          ) : null}

          {!isLoading && !analysis ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.035] p-8 text-center text-slate-300">
              Your results dashboard will show up here after the check.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
