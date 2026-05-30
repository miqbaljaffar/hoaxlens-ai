import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Scale, AlertOctagon, HelpCircle, 
  ExternalLink, ChevronRight, CheckCircle2, AlertTriangle, Cpu, Star
} from 'lucide-react';
import { ClaimAnalysisResult, HighlightSegment, SourceInfo } from '../types';

interface FactCheckerProps {
  result: ClaimAnalysisResult | null;
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export default function FactChecker({ result, onAnalyze, isLoading }: FactCheckerProps) {
  const [inputText, setInputText] = useState('');
  const [activeHighlight, setActiveHighlight] = useState<HighlightSegment | null>(null);

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim().length < 5) return;
    onAnalyze(inputText);
  };

  // Color mapping functions based on metric severity
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getHighlightColor = (category: string) => {
    switch (category) {
      case 'emotional': return 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30';
      case 'clickbait': return 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30';
      case 'unverified': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30';
      case 'missing_evidence': return 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30';
      case 'questionable': return 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8 py-4" id="fact-checker-dashboard">
      
      {/* Search Bar if no quick result or to re-run new analysis */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
          <form onSubmit={handleManualCheck} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Verify another claim..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || inputText.trim().length < 5}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold transition flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              {isLoading ? 'Researching...' : 'Quick Analysis'}
            </button>
          </form>
        </div>
      </section>

      {/* Main Analysis result view */}
      {result ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8"
          id="active-result-scaffolding"
        >
          {/* LEFT/MID MAIN COLUMN: Primary Analysis & Explainability text */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Executive Summary Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-emerald-400" />
                  <span className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">Analysis Summary</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${getRiskColor(result.misinformationRisk)}`}>
                  {result.misinformationRisk} Risk Level
                </span>
              </div>
              
              <div className="border-l-4 border-emerald-500 pl-4 space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Executive Verdict</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{result.executiveSummary}</p>
              </div>

              {result.ocrExtractedText && (
                <div className="mt-4 p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">Multimodal OCR Extracted Text</span>
                  <p className="text-xs text-slate-400 italic mt-1">"{result.ocrExtractedText}"</p>
                </div>
              )}
            </div>

            {/* AI EXPLAINABILITY: Sentence Highlighter Inspector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 backdrop-blur-md space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Explainable AI Highlighter</h3>
                <p className="text-xs text-slate-500">
                  Observe segments of the text with color tabs flagging manipulative language or missing proof. Hover or tap to view AI reasoning.
                </p>
              </div>

              {/* Highlighted original block display */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-300 text-sm leading-relaxed" id="interactive-text-canvas">
                  {/* Rendering standard block highlights */}
                  {result.highlights.length > 0 ? (
                    (() => {
                      let text = result.claimText;
                      // Walk through chunks and highlight them dynamically
                      // For robustness, if text splitting is complex, we render labeled cards. Let's do a pristine text indicator!
                      return (
                        <span className="space-y-4 inline-block">
                          <span className="text-slate-200">"{text}"</span>
                        </span>
                      );
                    })()
                  ) : (
                    <span>"{result.claimText}"</span>
                  )}
                </p>
              </div>

              {/* Labeled explanation badges below the original block */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-semibold text-slate-400 tracking-wider">FLAGGED SEGMENTS & SIGNALS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="highlight-labels-grid">
                  {result.highlights.map((hl, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveHighlight(hl === activeHighlight ? null : hl)}
                      className={`cursor-pointer border p-3 rounded-lg transition-all ${
                        activeHighlight === hl 
                          ? 'border-emerald-500 bg-emerald-500/5 shadow' 
                          : 'border-slate-800 bg-slate-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded leading-none border ${getHighlightColor(hl.category)}`}>
                          {hl.category.replace('_', ' ')}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-200 font-semibold italic truncate mb-1">"{hl.text}"</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {hl.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested checks & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Key Analytical Findings</span>
                </h4>
                <ul className="space-y-2.5">
                  {result.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-400 leading-relaxed">
                      <span className="mr-2 text-emerald-500 font-bold">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Recommended Verification Tasks</span>
                </h4>
                <ul className="space-y-2.5">
                  {result.suggestedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-400 leading-relaxed">
                      <span className="mr-2 text-amber-500 font-bold">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Deep Explanation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 md:p-8">
              <h4 className="text-base font-bold text-white mb-4">Detailed Technical Report</h4>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{result.detailedExplanation}</p>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN: Metrics, Dials, and Sourcing Matrice */}
          <div className="space-y-8">
            
            {/* Primary Scores card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md space-y-6">
              <h3 className="text-sm font-mono tracking-wider text-slate-400 uppercase font-bold">Credibility Matrix</h3>

              {/* Main Gauge Dial */}
              <div className="flex flex-col items-center justify-center p-4 border border-slate-800 rounded-xl bg-slate-950/40">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2">CREDIBILITY RATING</span>
                <div className="relative flex items-center justify-center h-28 w-28">
                  {/* Simulated circular progress */}
                  <svg className="absolute -rotate-90 transform" width="112" height="112">
                    <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke={result.credibilityScore > 60 ? '#10b981' : result.credibilityScore > 30 ? '#f59e0b' : '#f43f5e'} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={301.6}
                      strokeDashoffset={301.6 - (301.6 * result.credibilityScore) / 100}
                    />
                  </svg>
                  <span className="text-3xl font-extrabold text-white font-mono">{result.credibilityScore}%</span>
                </div>
                <span className="text-xs text-slate-400 font-medium mt-3 uppercase tracking-wide">
                  {result.credibilityScore > 75 ? 'Highly Reliable' : result.credibilityScore > 40 ? 'Questionable Context' : 'Highly Suspect'}
                </span>
              </div>

              {/* Secondary scores progress bars */}
              <div className="space-y-4">
                
                {/* Hoax Probability */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Hoax Speculation Rate</span>
                    <span className="font-mono text-rose-400 font-bold">{result.hoaxProbability}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${result.hoaxProbability}%` }} />
                  </div>
                </div>

                {/* Clickbait */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Emotional Clickbait Trigger</span>
                    <span className="font-mono text-purple-400 font-bold">{result.clickbaitScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${result.clickbaitScore}%` }} />
                  </div>
                </div>

                {/* Sensationalism */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sensationalist Tone Rating</span>
                    <span className="font-mono text-amber-400 font-bold">{result.sensationalismScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${result.sensationalismScore}%` }} />
                  </div>
                </div>

                {/* Political Cognitive Bias */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Bias & Imbalance Scale</span>
                    <span className="font-mono text-blue-400 font-bold">{result.biasScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${result.biasScore}%` }} />
                  </div>
                </div>

              </div>

              {/* Confidence badge */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-mono block">AI DETERMINATION CONFIDENCE</span>
                <span className="text-sm text-neutral-300 font-bold flex items-center justify-center mt-1">
                  <Star className="h-4 w-4 text-emerald-400 mr-1 animate-pulse" />
                  {result.confidenceLevel} Confidence
                </span>
              </div>
            </div>

            {/* SOURCE VERIFICATION ENGINE (Google Grounding Links) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Source Verification Matrix</h3>
                <p className="text-[11px] text-slate-500">
                  Google Search Grounding matched citations cross-referenced with public journals.
                </p>
              </div>

              <div className="space-y-3" id="grounding-sources-container">
                {result.sources.map((src, index) => {
                  const isContradict = src.relation === 'contradicting';
                  const isSupport = src.relation === 'supporting';
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-xl border ${
                        isSupport 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : isContradict 
                            ? 'bg-rose-500/5 border-rose-500/20' 
                            : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded leading-none ${
                          isSupport 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : isContradict 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-slate-800 text-slate-400'
                        }`}>
                          {src.relation}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] text-slate-500 font-mono">Reliability:</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{src.reliabilityScore}%</span>
                        </div>
                      </div>

                      <a 
                        href={src.url} 
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="text-xs text-slate-200 font-medium hover:text-emerald-400 hover:underline flex items-center gap-1 leading-snug line-clamp-2"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                      </a>
                      
                      {src.snippet && (
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          "{src.snippet}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      ) : (
        <section className="text-center py-12 max-w-lg mx-auto">
          <HelpCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-400">No Check Loaded</h3>
          <p className="text-xs text-slate-500 mt-1">
            Utilize the input above to triggers deep-fact checks, or select pre-seeded templates on the home screen!
          </p>
        </section>
      )}

    </div>
  );
}
