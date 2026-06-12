"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { SelectField } from "@/components/SelectField";
import { platforms, postTypes, vibes } from "@/lib/postOptions";
import type { AnalyzePostResponse } from "@/types/analysis";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

interface ImageCheckerFormProps {
  onResult: (analysis: AnalyzePostResponse) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function ImageCheckerForm({ onResult, onLoadingChange }: ImageCheckerFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [captionContext, setCaptionContext] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [postType, setPostType] = useState(postTypes[0]);
  const [desiredVibe, setDesiredVibe] = useState(vibes[0]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    if (!acceptedImageTypes.includes(nextFile.type)) {
      setError("Upload a PNG, JPG, or WebP screenshot.");
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Keep the screenshot under 4MB for this MVP.");
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    setError("");
    setImageFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!imageFile) {
      setError("Upload a screenshot first so RegretCheck has something to scan.");
      return;
    }

    setError("");
    setIsLoading(true);
    onLoadingChange(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("platform", platform);
    formData.append("postType", postType);
    formData.append("desiredVibe", desiredVibe);
    formData.append("captionContext", captionContext.trim());

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong while analyzing this screenshot.");
      }

      onResult(data as AnalyzePostResponse);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not analyze this screenshot right now.");
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur md:p-7">
      <label
        htmlFor="imageUpload"
        className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/25 p-4 text-center transition hover:border-mint/60 hover:bg-mint/5"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Uploaded post screenshot preview"
            width={900}
            height={640}
            className="max-h-80 w-full rounded-xl object-contain"
            unoptimized
          />
        ) : (
          <div>
            <p className="text-lg font-black text-white">Drop in a screenshot</p>
            <p className="mt-2 text-sm leading-6 text-smoke">Stories, tweets, draft captions, profile screenshots, or post previews.</p>
          </div>
        )}
        <input id="imageUpload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleFileChange} />
      </label>

      <div className="mt-4">
        <label htmlFor="captionContext" className="text-sm font-semibold text-slate-200">
          Extra context
        </label>
        <textarea
          id="captionContext"
          value={captionContext}
          onChange={(event) => setCaptionContext(event.target.value)}
          placeholder="Optional: what are you trying to say with this post?"
          className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-mint/70 focus:ring-4 focus:ring-mint/10"
          maxLength={500}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <SelectField label="Platform" value={platform} options={platforms} onChange={setPlatform} />
        <SelectField label="Post type" value={postType} options={postTypes} onChange={setPostType} />
        <SelectField label="Desired vibe" value={desiredVibe} options={vibes} onChange={setDesiredVibe} />
      </div>

      {error ? <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-2xl bg-mint px-5 py-4 text-base font-black text-ink transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? "Scanning..." : "Check My Screenshot"}
      </button>
    </form>
  );
}
