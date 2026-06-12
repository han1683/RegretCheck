import type { AnalyzePostResponse, Recommendation, RiskLevel, RiskScores } from "@/types/analysis";

const riskLevels: RiskLevel[] = ["Low", "Medium", "High", "Very High"];
const recommendations: Recommendation[] = ["Post it", "Edit first", "Do not post"];
const scoreKeys: Array<keyof RiskScores> = [
  "cringeRisk",
  "employerRisk",
  "privacyRisk",
  "brandRisk",
  "dramaRisk",
  "misunderstandingRisk",
];

export const analysisResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallScore",
    "riskLevel",
    "mainConcern",
    "scores",
    "whyYouMightRegretIt",
    "saferVersion",
    "confidentVersion",
    "professionalVersion",
    "funnyVersion",
    "recommendation",
  ],
  properties: {
    overallScore: {
      type: "number",
      description: "Overall regret risk from 0 to 100.",
    },
    riskLevel: {
      type: "string",
      enum: riskLevels,
    },
    mainConcern: {
      type: "string",
      description: "One concise sentence naming the biggest perception risk.",
    },
    scores: {
      type: "object",
      additionalProperties: false,
      required: scoreKeys,
      properties: {
        cringeRisk: { type: "number" },
        employerRisk: { type: "number" },
        privacyRisk: { type: "number" },
        brandRisk: { type: "number" },
        dramaRisk: { type: "number" },
        misunderstandingRisk: { type: "number" },
      },
    },
    whyYouMightRegretIt: {
      type: "array",
      items: { type: "string" },
      description: "Two to four direct, helpful reasons.",
    },
    saferVersion: { type: "string" },
    confidentVersion: { type: "string" },
    professionalVersion: { type: "string" },
    funnyVersion: { type: "string" },
    recommendation: {
      type: "string",
      enum: recommendations,
    },
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampScore(value: unknown) {
  const numberValue = typeof value === "number" && Number.isFinite(value) ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error("Analysis response included an invalid score.");
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function requireString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Analysis response is missing ${fieldName}.`);
  }

  return value.trim();
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "Very High";
  if (score >= 65) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function getRecommendation(score: number): Recommendation {
  if (score >= 82) return "Do not post";
  if (score >= 38) return "Edit first";
  return "Post it";
}

export function normalizeAnalysisResponse(value: unknown): AnalyzePostResponse {
  if (!isRecord(value)) {
    throw new Error("Analysis response was not an object.");
  }

  const rawScores = value.scores;

  if (!isRecord(rawScores)) {
    throw new Error("Analysis response is missing risk scores.");
  }

  const scores = scoreKeys.reduce((nextScores, key) => {
    return {
      ...nextScores,
      [key]: clampScore(rawScores[key]),
    };
  }, {} as RiskScores);

  const overallScore = clampScore(value.overallScore);
  const reasons = Array.isArray(value.whyYouMightRegretIt)
    ? value.whyYouMightRegretIt.map((reason) => requireString(reason, "whyYouMightRegretIt")).slice(0, 4)
    : [];

  if (reasons.length === 0) {
    throw new Error("Analysis response did not include regret reasons.");
  }

  const riskLevel = riskLevels.includes(value.riskLevel as RiskLevel)
    ? (value.riskLevel as RiskLevel)
    : getRiskLevel(overallScore);

  const recommendation = recommendations.includes(value.recommendation as Recommendation)
    ? (value.recommendation as Recommendation)
    : getRecommendation(overallScore);

  return {
    overallScore,
    riskLevel,
    mainConcern: requireString(value.mainConcern, "mainConcern"),
    scores,
    whyYouMightRegretIt: reasons,
    saferVersion: requireString(value.saferVersion, "saferVersion"),
    confidentVersion: requireString(value.confidentVersion, "confidentVersion"),
    professionalVersion: requireString(value.professionalVersion, "professionalVersion"),
    funnyVersion: requireString(value.funnyVersion, "funnyVersion"),
    recommendation,
  };
}
