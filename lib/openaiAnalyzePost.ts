import { analysisResponseSchema, normalizeAnalysisResponse } from "@/lib/analysisResponse";
import type { AnalyzePostRequest, AnalyzePostResponse } from "@/types/analysis";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

const systemPrompt = `You are RegretCheck, a pre-post social media judgment assistant.

Your job is to help users decide whether a caption, post, or social update could damage their image before it goes live.

Tone rules:
- Be honest, direct, useful, and slightly playful.
- Do not shame, insult, moralize, or diagnose the user.
- Focus on perception risk: cringe, drama, privacy, employer, brand, and misunderstanding.
- Give rewrites that preserve the user's intent while reducing regret risk.
- Keep explanations concise and practical.

Scoring rules:
- Scores are 0 to 100.
- Increase drama and employer risk for aggressive or targeted language.
- Increase employer and brand risk for swearing, especially on LinkedIn, work, career, or business posts.
- Increase privacy risk for emails, phone numbers, addresses, license plates, full names, school names, workplace details, or other identifying info.
- Increase cringe and misunderstanding risk for vague, overly emotional, or indirect captions.
- Business and creator-brand posts should be judged more carefully for tone and trust.
- The final recommendation should be "Post it", "Edit first", or "Do not post".`;

interface OpenAIResponseContent {
  type?: string;
  text?: string;
}

interface OpenAIResponseOutput {
  content?: OpenAIResponseContent[];
}

interface OpenAIResponseBody {
  output_text?: string;
  output?: OpenAIResponseOutput[];
  error?: {
    message?: string;
  };
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function analyzePostWithOpenAI(request: AnalyzePostRequest): Promise<AnalyzePostResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Analyze this planned social media post for regret risk.",
            postText: request.postText,
            platform: request.platform,
            postType: request.postType,
            desiredVibe: request.desiredVibe,
          }),
        },
      ],
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "regretcheck_analysis",
          description: "Structured RegretCheck post analysis.",
          schema: analysisResponseSchema,
          strict: true,
        },
      },
    }),
  });

  const data = (await response.json()) as OpenAIResponseBody;

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI analysis request failed.");
  }

  const outputText = extractOutputText(data);

  if (!outputText) {
    throw new Error("OpenAI response did not include text output.");
  }

  return normalizeAnalysisResponse(JSON.parse(outputText));
}

function extractOutputText(data: OpenAIResponseBody) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")
    ?.text;
}
