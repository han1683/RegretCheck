"use client";

import { FormEvent, useState } from "react";
import { SelectField } from "@/components/SelectField";
import { platforms, postTypes, vibes } from "@/lib/postOptions";
import type { AnalyzePostRequest, AnalyzePostResponse } from "@/types/analysis";

interface PostCheckerFormProps {
  onResult: (analysis: AnalyzePostResponse) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function PostCheckerForm({ onResult, onLoadingChange }: PostCheckerFormProps) {
  const [form, setForm] = useState<AnalyzePostRequest>({
    postText: "",
    platform: platforms[0],
    postType: postTypes[0],
    desiredVibe: vibes[0],
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPost = form.postText.trim();

    if (!trimmedPost) {
      setError("Paste the post first. I need something to gently judge.");
      return;
    }

    setError("");
    setIsLoading(true);
    onLoadingChange(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, postText: trimmedPost }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong while analyzing this post.");
      }

      onResult(data as AnalyzePostResponse);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not analyze this post right now.");
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur md:p-7">
      <label htmlFor="postText" className="text-sm font-semibold text-slate-200">
        Your caption or post
      </label>
      <textarea
        id="postText"
        value={form.postText}
        onChange={(event) => setForm((current) => ({ ...current, postText: event.target.value }))}
        placeholder="Some people are fake af, watch who you call friends."
        className="mt-3 min-h-44 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 text-base leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-mint/70 focus:ring-4 focus:ring-mint/10"
        maxLength={1200}
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-smoke">
        <span>{form.postText.length}/1200 characters</span>
        <span>Honest feedback, no shame spiral.</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SelectField
          label="Platform"
          value={form.platform}
          options={platforms}
          onChange={(value) => setForm((current) => ({ ...current, platform: value }))}
        />
        <SelectField
          label="Post type"
          value={form.postType}
          options={postTypes}
          onChange={(value) => setForm((current) => ({ ...current, postType: value }))}
        />
        <SelectField
          label="Desired vibe"
          value={form.desiredVibe}
          options={vibes}
          onChange={(value) => setForm((current) => ({ ...current, desiredVibe: value }))}
        />
      </div>

      {error ? <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-2xl bg-mint px-5 py-4 text-base font-black text-ink transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? "Checking..." : "Check My Post"}
      </button>
    </form>
  );
}
