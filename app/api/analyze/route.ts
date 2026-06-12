import { NextResponse } from "next/server";
import { analyzePostMock } from "@/lib/analyzePost";
import type { AnalyzePostRequest } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AnalyzePostRequest>;

    if (!body.postText || !body.platform || !body.postType || !body.desiredVibe) {
      return NextResponse.json(
        { error: "Post text, platform, post type, and desired vibe are required." },
        { status: 400 },
      );
    }

    const payload: AnalyzePostRequest = {
      postText: body.postText,
      platform: body.platform,
      postType: body.postType,
      desiredVibe: body.desiredVibe,
    };

    // Future AI provider hook: if process.env.OPENAI_API_KEY exists, call the model here.
    const analysis = analyzePostMock(payload);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Could not analyze this post right now. Try again in a moment." },
      { status: 500 },
    );
  }
}
