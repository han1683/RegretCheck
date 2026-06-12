import { NextResponse } from "next/server";
import { analyzePostMock } from "@/lib/analyzePost";
import { analyzePostWithOpenAI, isOpenAIConfigured } from "@/lib/openaiAnalyzePost";
import type { AnalyzePostRequest } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AnalyzePostRequest>;
    const postText = body.postText?.trim();

    if (!postText || !body.platform || !body.postType || !body.desiredVibe) {
      return NextResponse.json(
        { error: "Post text, platform, post type, and desired vibe are required." },
        { status: 400 },
      );
    }

    const payload: AnalyzePostRequest = {
      postText,
      platform: body.platform,
      postType: body.postType,
      desiredVibe: body.desiredVibe,
    };

    const analysis = await analyzePost(payload);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Could not analyze this post right now. Try again in a moment." },
      { status: 500 },
    );
  }
}

async function analyzePost(payload: AnalyzePostRequest) {
  if (!isOpenAIConfigured()) {
    return analyzePostMock(payload);
  }

  try {
    return await analyzePostWithOpenAI(payload);
  } catch (error) {
    console.error("OpenAI analysis failed. Falling back to mock analysis.", error);
    return analyzePostMock(payload);
  }
}
