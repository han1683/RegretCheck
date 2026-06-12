import { NextResponse } from "next/server";
import { analyzeImageMock } from "@/lib/analyzePost";
import { analyzeImageWithOpenAI, isOpenAIConfigured } from "@/lib/openaiAnalyzePost";
import type { AnalyzeImageRequest } from "@/types/analysis";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const platform = getStringField(formData, "platform");
    const postType = getStringField(formData, "postType");
    const desiredVibe = getStringField(formData, "desiredVibe");
    const captionContext = getStringField(formData, "captionContext");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Upload a screenshot to analyze." }, { status: 400 });
    }

    if (!acceptedImageTypes.has(image.type)) {
      return NextResponse.json({ error: "Upload a PNG, JPG, or WebP screenshot." }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: "Keep screenshots under 4MB for this MVP." }, { status: 400 });
    }

    if (!platform || !postType || !desiredVibe) {
      return NextResponse.json({ error: "Platform, post type, and desired vibe are required." }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const payload: AnalyzeImageRequest = {
      imageDataUrl: `data:${image.type};base64,${imageBuffer.toString("base64")}`,
      imageMimeType: image.type,
      platform,
      postType,
      desiredVibe,
      captionContext,
    };

    const analysis = await analyzeImage(payload);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Could not analyze this screenshot right now. Try again in a moment." },
      { status: 500 },
    );
  }
}

async function analyzeImage(payload: AnalyzeImageRequest) {
  if (!isOpenAIConfigured()) {
    return analyzeImageMock(payload);
  }

  try {
    return await analyzeImageWithOpenAI(payload);
  } catch (error) {
    console.error("OpenAI image analysis failed. Falling back to mock analysis.", error);
    return analyzeImageMock(payload);
  }
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
