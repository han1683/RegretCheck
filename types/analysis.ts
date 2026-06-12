export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export type Recommendation = "Post it" | "Edit first" | "Do not post";

export interface AnalyzePostRequest {
  postText: string;
  platform: string;
  postType: string;
  desiredVibe: string;
}

export interface RiskScores {
  cringeRisk: number;
  employerRisk: number;
  privacyRisk: number;
  brandRisk: number;
  dramaRisk: number;
  misunderstandingRisk: number;
}

export interface AnalyzePostResponse {
  overallScore: number;
  riskLevel: RiskLevel;
  mainConcern: string;
  scores: RiskScores;
  whyYouMightRegretIt: string[];
  saferVersion: string;
  confidentVersion: string;
  professionalVersion: string;
  funnyVersion: string;
  recommendation: Recommendation;
}
