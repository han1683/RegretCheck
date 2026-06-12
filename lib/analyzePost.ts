import type {
  AnalyzePostRequest,
  AnalyzePostResponse,
  AnalyzeImageRequest,
  Recommendation,
  RiskLevel,
  RiskScores,
} from "@/types/analysis";

const aggressiveWords = [
  "hate",
  "fake",
  "trash",
  "loser",
  "clown",
  "exposed",
  "cancel",
  "fight",
  "stupid",
  "pathetic",
  "toxic",
];

const swearWords = ["af", "fuck", "shit", "bitch", "asshole", "damn", "wtf"];

const indirectPhrases = [
  "some people",
  "you know who you are",
  "watch who",
  "real ones know",
  "not naming names",
  "they know",
  "certain people",
];

const emotionalPhrases = [
  "i'm done",
  "never again",
  "can't trust anyone",
  "i'm so tired",
  "nobody understands",
  "everything is ruined",
  "over it",
];

const casualBusinessWords = ["grind", "hustle", "haters", "bossed up", "rich rich", "no days off"];

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countMatches(text: string, words: string[]) {
  return words.reduce((count, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    return count + (text.match(regex)?.length ?? 0);
  }, 0);
}

function hasPrivateInfo(text: string) {
  const patterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
    /\b\d{1,5}\s+[A-Za-z0-9'.-]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct)\b/i,
    /\b[A-Z]{1,3}[-\s]?\d{3,4}\b/,
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
    /\b(?:high school|middle school|university|college|academy)\b/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
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

function getMainConcern(scores: RiskScores, postType: string) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topRisk = entries[0]?.[0];

  if (topRisk === "privacyRisk") {
    return "This may reveal personal details that are better kept out of a public post.";
  }

  if (topRisk === "dramaRisk") {
    return "This reads like indirect drama, so people may assume you are calling someone out.";
  }

  if (topRisk === "employerRisk") {
    return "This could land differently if a manager, client, teacher, or recruiter sees it.";
  }

  if (topRisk === "brandRisk" || postType === "Business") {
    return "The tone may distract from the image or brand you are trying to build.";
  }

  if (topRisk === "misunderstandingRisk") {
    return "The message is vague enough that people could fill in the blanks the wrong way.";
  }

  return "The post mostly works, but a small edit could make it land cleaner.";
}

function buildReasons(scores: RiskScores, postType: string) {
  const reasons: string[] = [];

  if (scores.dramaRisk >= 45) {
    reasons.push("People may start guessing who the post is about, which can create drama you did not ask for.");
  }

  if (scores.employerRisk >= 45) {
    reasons.push("It may feel too intense or unfiltered if seen by coworkers, recruiters, clients, or teachers.");
  }

  if (scores.privacyRisk >= 45) {
    reasons.push("It appears to include personal details that could expose you or someone else.");
  }

  if (scores.cringeRisk >= 45) {
    reasons.push("The emotion is understandable, but the wording could come across more dramatic than intended.");
  }

  if (scores.brandRisk >= 45 || postType === "Business") {
    reasons.push("It could pull attention away from the polished image you probably want people to remember.");
  }

  if (scores.misunderstandingRisk >= 45) {
    reasons.push("The wording leaves room for people to misread your intent.");
  }

  if (reasons.length === 0) {
    reasons.push("The post is clear and low-risk, but tightening the wording can still make it stronger.");
  }

  return reasons.slice(0, 4);
}

function createRewrites(request: AnalyzePostRequest, scores: RiskScores) {
  const topic = request.postType.toLowerCase();
  const isDrama = scores.dramaRisk >= 45;
  const isBusiness = request.postType === "Business";

  if (isDrama) {
    return {
      saferVersion: "Learning to keep my circle peaceful and protect my energy.",
      confidentVersion: "I’m being more intentional about the people and energy I keep around me.",
      professionalVersion: "Growth also means being selective with where you spend your time and energy.",
      funnyVersion: "Me realizing peace is better than explaining myself.",
    };
  }

  if (isBusiness) {
    return {
      saferVersion: "Sharing a quick update and keeping the focus on the value we are building.",
      confidentVersion: "Proud of the progress, grateful for the momentum, and ready for what is next.",
      professionalVersion: "Excited to share this update and continue building with clarity and consistency.",
      funnyVersion: "Small update, big main-character-in-a-spreadsheet energy.",
    };
  }

  return {
    saferVersion: `Keeping this ${topic} post clean, clear, and true to the vibe.`,
    confidentVersion: "Saying it with confidence, keeping it calm, and letting the moment speak.",
    professionalVersion: "Sharing this with a clear tone and a little more polish.",
    funnyVersion: "Posting this before my drafts folder starts charging rent.",
  };
}

export function analyzePostMock(request: AnalyzePostRequest): AnalyzePostResponse {
  const text = request.postText.trim();
  const normalized = text.toLowerCase();
  const aggressiveCount = countMatches(normalized, aggressiveWords);
  const swearCount = countMatches(normalized, swearWords);
  const indirectCount = countMatches(normalized, indirectPhrases);
  const emotionalCount = countMatches(normalized, emotionalPhrases);
  const casualBusinessCount = countMatches(normalized, casualBusinessWords);
  const hasQuestionablePrivacy = hasPrivateInfo(text);
  const isBusinessContext = ["Business", "Work/Career", "LinkedIn"].includes(request.postType) || request.platform === "LinkedIn";
  const vague = text.length < 45 || /\b(it|this|that|they|them)\b/i.test(text);

  const scores: RiskScores = {
    cringeRisk: clampScore(20 + emotionalCount * 20 + indirectCount * 12 + (vague ? 10 : 0)),
    employerRisk: clampScore(18 + aggressiveCount * 16 + swearCount * 24 + (isBusinessContext ? 14 : 0)),
    privacyRisk: clampScore(8 + (hasQuestionablePrivacy ? 58 : 0)),
    brandRisk: clampScore(16 + swearCount * 18 + aggressiveCount * 18 + (isBusinessContext ? casualBusinessCount * 18 + 14 : 0)),
    dramaRisk: clampScore(18 + aggressiveCount * 24 + indirectCount * 32 + emotionalCount * 12),
    misunderstandingRisk: clampScore(20 + indirectCount * 18 + emotionalCount * 12 + (vague ? 18 : 0)),
  };

  const overallScore =
    scores.privacyRisk >= 45
      ? clampScore(
          scores.cringeRisk * 0.12 +
            scores.employerRisk * 0.15 +
            scores.privacyRisk * 0.3 +
            scores.brandRisk * 0.13 +
            scores.dramaRisk * 0.17 +
            scores.misunderstandingRisk * 0.13,
        )
      : clampScore(
          scores.cringeRisk * 0.05 +
            scores.employerRisk * 0.2 +
            scores.brandRisk * 0.15 +
            scores.dramaRisk * 0.45 +
            scores.misunderstandingRisk * 0.15,
        );

  const rewrites = createRewrites(request, scores);

  return {
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    mainConcern: getMainConcern(scores, request.postType),
    scores,
    whyYouMightRegretIt: buildReasons(scores, request.postType),
    ...rewrites,
    recommendation: getRecommendation(overallScore),
  };
}

export function analyzeImageMock(request: AnalyzeImageRequest): AnalyzePostResponse {
  const context = request.captionContext?.trim();
  const baseAnalysis = analyzePostMock({
    postText:
      context ||
      `Uploaded ${request.postType.toLowerCase()} screenshot for ${request.platform}. Check visible text, background details, and overall vibe.`,
    platform: request.platform,
    postType: request.postType,
    desiredVibe: request.desiredVibe,
  });

  const scores: RiskScores = {
    cringeRisk: clampScore(baseAnalysis.scores.cringeRisk + 4),
    employerRisk: clampScore(baseAnalysis.scores.employerRisk + (request.platform === "LinkedIn" ? 10 : 4)),
    privacyRisk: clampScore(baseAnalysis.scores.privacyRisk + 22),
    brandRisk: clampScore(baseAnalysis.scores.brandRisk + (["Business", "Work/Career"].includes(request.postType) ? 12 : 6)),
    dramaRisk: clampScore(baseAnalysis.scores.dramaRisk + 4),
    misunderstandingRisk: clampScore(baseAnalysis.scores.misunderstandingRisk + 10),
  };

  const overallScore = clampScore(
    scores.cringeRisk * 0.1 +
      scores.employerRisk * 0.15 +
      scores.privacyRisk * 0.25 +
      scores.brandRisk * 0.15 +
      scores.dramaRisk * 0.2 +
      scores.misunderstandingRisk * 0.15,
  );

  const imageReasons = [
    "Screenshots can reveal names, handles, faces, locations, notifications, or background details that text-only checks miss.",
    "Crop anything personal before posting so the focus stays on the message, not accidental context.",
  ];

  return {
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    mainConcern: context
      ? `${baseAnalysis.mainConcern} Also check the screenshot for visible personal details before posting.`
      : "The biggest screenshot risk is accidental context: names, faces, locations, or background details may say more than the caption.",
    scores,
    whyYouMightRegretIt: [...imageReasons, ...baseAnalysis.whyYouMightRegretIt].slice(0, 4),
    saferVersion: context
      ? baseAnalysis.saferVersion
      : "Crop personal details, keep the visual clean, and use a caption that says exactly what you mean.",
    confidentVersion: context
      ? baseAnalysis.confidentVersion
      : "Clean screenshot, clear caption, calm delivery.",
    professionalVersion: context
      ? baseAnalysis.professionalVersion
      : "Use a cropped, polished version that keeps private details out of frame.",
    funnyVersion: context ? baseAnalysis.funnyVersion : "Posting the clean crop because future me deserves peace.",
    recommendation: getRecommendation(overallScore),
  };
}
