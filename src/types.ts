/**
 * Shared Type Definitions for HoaxLens AI
 */

export interface HighlightSegment {
  text: string;
  category: 'emotional' | 'clickbait' | 'unverified' | 'missing_evidence' | 'questionable' | 'neutral';
  explanation: string;
}

export interface SourceInfo {
  title: string;
  url: string;
  relation: 'supporting' | 'contradicting' | 'neutral';
  reliabilityScore: number; // 0 - 100
  snippet?: string;
}

export interface ClaimAnalysisResult {
  id: string;
  claimText: string;
  category: 'Politics' | 'Health' | 'Technology' | 'Finance' | 'Education' | 'Social Issues';
  credibilityScore: number; // 0 - 100
  hoaxProbability: number; // 0 - 100
  clickbaitScore: number; // 0 - 100
  sensationalismScore: number; // 0 - 100
  biasScore: number; // 0 - 100
  misinformationRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  executiveSummary: string;
  detailedExplanation: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  keyFindings: string[];
  suggestedSteps: string[];
  highlights: HighlightSegment[];
  sources: SourceInfo[];
  createdAt: string;
  ocrExtractedText?: string;
  imageUrl?: string;
}

export interface TrendingHoaxItem {
  id: string;
  title: string;
  category: string;
  viralityScore: number; // 0 - 100
  hoaxProbability: number;
  status: 'critical' | 'warning' | 'active';
  checkedCount: number;
  description: string;
}

export interface DashboardStats {
  totalClaimsChecked: number;
  hoaxesDetected: number;
  criticalRisks: number;
  averageCredibility: number;
  weeklyTrends: { name: string; checked: number; hoaxes: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  recentChecks: ClaimAnalysisResult[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}
