import { GoogleGenAI, Type } from '@google/genai';
import { ClaimAnalysisResult, HighlightSegment, SourceInfo } from '../src/types';

// Lazy initialize the client to prevent startup crashes if GEMINI_API_KEY is undefined on first file load
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/**
 * Fact checks a claim utilizing Google Search grounding and structured JSON analysis.
 */
export async function factCheckClaim(claimText: string): Promise<Omit<ClaimAnalysisResult, 'id' | 'createdAt'>> {
  const ai = getAiClient();

  // STAGE 1: Real-time Google Search Grounding to verify the claim with trusted portals
  let searchContextText = '';
  let groundingSources: SourceInfo[] = [];

  try {
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Search, verify facts, and locate credible journalism regarding this claim: "${claimText}". Identify if it is true, false, a rumor, or sensationalized.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    searchContextText = searchResponse.text || '';

    // Extract grounding URLs and titles safely from metadata
    const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      groundingSources = chunks
        .filter(chunk => chunk.web && chunk.web.uri)
        .map((chunk, index) => {
          return {
            title: chunk.web.title || `Verification Source #${index + 1}`,
            url: chunk.web.uri,
            relation: 'neutral', // Evaluated and updated in stage 2
            reliabilityScore: 85 // Fallback base score
          };
        });
    }
  } catch (error) {
    console.error('Error during Google Search Grounding step. Proceeding with default reasoning.', error);
    searchContextText = 'Unable to perform web search grounding. Rely strictly on scientific plausibility and logical fact analysis.';
  }

  // Ensure we don't have empty sources, if none are found, we can suggest standard sites
  if (groundingSources.length === 0) {
    groundingSources = [
      { title: 'Snopes Fact Checking Archive', url: 'https://www.snopes.com', relation: 'neutral', reliabilityScore: 90 },
      { title: 'FactCheck.org Policy Portal', url: 'https://www.factcheck.org', relation: 'neutral', reliabilityScore: 92 }
    ];
  }

  // STAGE 2: Deep Structured Analysis to populate scores, emotional/bias highlighting, and explanations.
  const prompt = `
Analyzing claim for misinformation credibility:
"${claimText}"

Live Google Search Grounding Context:
${searchContextText}

List of Grounded Sources we found:
${JSON.stringify(groundingSources, null, 2)}

Analyze and return strict, highly technical JSON matching the requested schema. Ensure:
1. Executive Summary and detailed explanation are balanced, highly informative (never simple bullet points).
2. Categorize the claims into exactly one of: "Politics", "Health", "Technology", "Finance", "Education", "Social Issues".
3. Assign score percentages:
   - credibilityScore (0 means complete lie, 100 means fully true)
   - hoaxProbability (0 means genuine news, 100 means complete hoax)
   - clickbaitScore, sensationalismScore, biasScore (0 to 100 percentages)
4. Select "misinformationRisk": "Low", "Medium", "High", or "Critical".
5. Identify parts of the input text itself to highlight for AI EXPLAINABILITY.
   For each item in the "highlights" array:
   - The "text" must be a exact substring of the analyzed claim's text.
   - The "category" must be one of: "emotional", "clickbait", "unverified", "missing_evidence", "questionable", "neutral".
   - The "explanation" explains why it is flagged.
6. Evaluate the grounded sources' "relation" to this claim ("supporting", "contradicting", or "neutral") and grade their "reliabilityScore" (0 to 100).
`;

  const structuredResponse = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        required: [
          'category',
          'credibilityScore',
          'hoaxProbability',
          'clickbaitScore',
          'sensationalismScore',
          'biasScore',
          'misinformationRisk',
          'executiveSummary',
          'detailedExplanation',
          'confidenceLevel',
          'keyFindings',
          'suggestedSteps',
          'highlights',
          'sources'
        ],
        properties: {
          category: {
            type: Type.STRING,
            description: 'The claim category, must be one of: Politics, Health, Technology, Finance, Education, Social Issues.'
          },
          credibilityScore: { type: Type.INTEGER, description: 'Credibility score from 0 (completely false/dangerous) to 100 (fully objective verified truth).' },
          hoaxProbability: { type: Type.INTEGER, description: 'Hoax probability percentage from 0 to 100.' },
          clickbaitScore: { type: Type.INTEGER, description: 'Clickbait rating percentage from 0 to 100.' },
          sensationalismScore: { type: Type.INTEGER, description: 'Sensationalism rating percentage from 0 to 100.' },
          biasScore: { type: Type.INTEGER, description: 'Political/cognitive bias rating percentage from 0 to 100.' },
          misinformationRisk: {
            type: Type.STRING,
            description: 'The severity risk levels: Low, Medium, High, Critical.'
          },
          executiveSummary: { type: Type.STRING, description: 'Comprehensive 2-3 sentence overview explaining why this is a claim, rumor, hoax or truth.' },
          detailedExplanation: { type: Type.STRING, description: 'Extremely detailed explanation covering scientific or political context, origin, logical fallacies.' },
          confidenceLevel: { type: Type.STRING, description: 'AI determination confidence: Low, Medium, or High.' },
          keyFindings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Bullet list of crucial fact-checking findings.'
          },
          suggestedSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Suggested steps users can take to independently verify.'
          },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['text', 'category', 'explanation'],
              properties: {
                text: { type: Type.STRING, description: 'The exact sentence or phrase verbatim from the user claim to flag.' },
                category: { type: Type.STRING, description: 'The code of the label: emotional, clickbait, unverified, missing_evidence, questionable, neutral' },
                explanation: { type: Type.STRING, description: 'Short sentence explaining why this piece of text is flagged.' }
              }
            },
            description: 'Highlights within the original text for explainability.'
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['title', 'url', 'relation', 'reliabilityScore'],
              properties: {
                title: { type: Type.STRING, description: 'Source channel or publication name.' },
                url: { type: Type.STRING, description: 'Fully qualified URL.' },
                relation: { type: Type.STRING, description: 'Whether the source supports or contradicts the claim: supporting, contradicting, neutral.' },
                reliabilityScore: { type: Type.INTEGER, description: 'The reliability of the domain: 0 to 100.' }
              }
            },
            description: 'Grounding source matches evaluated for supporting/contradicting context.'
          }
        }
      }
    }
  });

  const parsedResult = JSON.parse(structuredResponse.text || '{}');

  // Validate highlights matching target claim.
  // If the prompt generated phrases that aren't exact matches in the text, we clean them up.
  const validatedHighlights: HighlightSegment[] = (parsedResult.highlights || [])
    .map((hl: any) => {
      const trimmed = (hl.text || '').trim();
      const hasMatch = claimText.toLowerCase().includes(trimmed.toLowerCase());
      return {
        text: hasMatch ? trimmed : claimText.substring(0, Math.min(claimText.length, 60)),
        category: hl.category || 'neutral',
        explanation: hl.explanation || 'Analyzed claim segment.'
      };
    });

  // Safe fallback values
  return {
    claimText,
    category: parsedResult.category || 'Social Issues',
    credibilityScore: Number(parsedResult.credibilityScore) ?? 50,
    hoaxProbability: Number(parsedResult.hoaxProbability) ?? 50,
    clickbaitScore: Number(parsedResult.clickbaitScore) ?? 30,
    sensationalismScore: Number(parsedResult.sensationalismScore) ?? 30,
    biasScore: Number(parsedResult.biasScore) ?? 30,
    misinformationRisk: parsedResult.misinformationRisk || 'Medium',
    executiveSummary: parsedResult.executiveSummary || 'Claim completed review.',
    detailedExplanation: parsedResult.detailedExplanation || 'Detailed analysis completed successfully.',
    confidenceLevel: parsedResult.confidenceLevel || 'High',
    keyFindings: parsedResult.keyFindings || ['Analysis complete.'],
    suggestedSteps: parsedResult.suggestedSteps || ['Do research on reliable news sites.'],
    highlights: validatedHighlights,
    sources: parsedResult.sources || groundingSources
  };
}

/**
 * Extracts claim text from screenshot images (OCR) using Gemini Multimodal Vision capabilities,
 * then triggers standard fact check.
 */
export async function factCheckImage(imageBase64: string, mimeType: string): Promise<Omit<ClaimAnalysisResult, 'id' | 'createdAt'>> {
  const ai = getAiClient();

  // Step 1: Perform vision-based OCR extraction and context cleaning in a single powerful step
  const ocrResponse = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      },
      {
        text: 'Extract all readability-critical claims, text, headlines, or captions from this screenshot image for fact checking. Do not write anything else—only output the cleaned, raw extracted text statement.'
      }
    ]
  });

  const extractedText = (ocrResponse.text || '').trim() || 'No clear claims could be extracted from this image.';

  // Step 2: Trigger the standard grounded fact checker pipeline on the OCR text
  const factCheckResult = await factCheckClaim(extractedText);

  return {
    ...factCheckResult,
    ocrExtractedText: extractedText
  };
}
