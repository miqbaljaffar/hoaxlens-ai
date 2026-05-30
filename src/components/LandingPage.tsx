import React, { useState } from 'react';
import { Search, Loader2, Sparkles, BookOpen, AlertTriangle, ShieldCheck, Flame, Cpu } from 'lucide-react';

interface LandingPageProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  setActiveTab: (tab: string) => void;
}

const SAMPLE_CLAIMS = [
  {
    title: 'Cellular Saltwater Claim',
    text: 'A secret wellness laboratory states that drinking three liters of ocean saltwater daily hydrates cellular telomeres, curing basic aging and expanding lifetimes by 20 to 30 years.'
  },
  {
    title: 'Impending CME Coronal storm',
    text: 'BREAKING NEWS: NOAA confirms a massive coronal mass ejection solar storm will slam world internet grids and permanently melt submarine fiber optic cables next Tuesday causing an worldwide apocalypse.'
  },
  {
    title: 'University Degrees Cancelation',
    text: 'Leaked legal documents highlight a new education act: all national university degrees older than ten years will be canceled next month unless graduates clear a $200 retesting fee.'
  }
];

export default function LandingPage({ onAnalyze, isLoading, setActiveTab }: LandingPageProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim().length < 5) return;
    onAnalyze(inputText);
  };

  const handleSelectSample = (text: string) => {
    setInputText(text);
    // Auto scroll down to input or submit immediately
    onAnalyze(text);
  };

  return (
    <div className="space-y-16 py-8" id="landing-page-flow">
      {/* 1. HERO LOGO HEADER */}
      <section className="text-center max-w-3xl mx-auto space-y-6 px-4 animate-fade-in">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-mono">
          <Sparkles className="h-3 w-3 animate-spin" />
          <span>Real-time Semantic Google Search Grounding Enabled</span>
        </div>
        
        <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Unmask Misinformation with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Gemini AI</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-400 font-sans tracking-wide leading-relaxed">
          The autonomous fact-checking system. Paste news clippings, quotes, URLs, or screenshots to instantly verify validity, biases, clickbait sensationalism, and credible source links.
        </p>
      </section>

      {/* 2. MAIN INPUT AREA */}
      <section className="max-w-4xl mx-auto px-4" id="main-analytics-box">
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-indigo-950/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste news title, social media rumor, website URL, or controversial science claim to review credibility..."
                rows={4}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-4 pt-4 pr-12 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-none transition-all font-sans"
                id="claim-text-area"
              />
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {inputText.length} characters
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-sans">
                <Cpu className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Powered by gemini-3.5-flash JSON cognitive pipeline.</span>
              </div>

              <div className="flex w-full sm:w-auto space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ocr')}
                  className="w-1/2 sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold transition"
                >
                  <span>Upload Screenshot</span>
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || inputText.trim().length < 5}
                  className="w-1/2 sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-600 outline-none px-6 py-2.5 rounded-xl text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Researching Groundings...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 text-slate-950" />
                      <span>Scan Claim</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 3. CONTROVERSIAL CLAIM SAMPLES */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center space-x-2 text-slate-300 font-serif">
          <Flame className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold">Trending Misinformation Templates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="samples-grid">
          {SAMPLE_CLAIMS.map((claim, idx) => (
            <div
              key={idx}
              id={`claim-sample-${idx}`}
              onClick={() => handleSelectSample(claim.text)}
              className="group cursor-pointer rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/20 p-5 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition tracking-wide font-sans flex items-center justify-between">
                  <span>{claim.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">#0{idx + 1}</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                  "{claim.text}"
                </p>
              </div>
              <p className="text-[10px] text-emerald-400 group-hover:underline mt-4 font-semibold text-right">
                Run verification scan →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM CORE PILLARS BANNER */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-900">
        <div className="space-y-2">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Explainable AI</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Highlight sentences triggering clickbait, bias, emotional tricks, or lack of proof with clear tags.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Multimodal OCR</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Read claims seamlessly from fake Whatsapp forwards or fabricated news site screenshots.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Grounding Matrix</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Validate claims real-time against World Health Organization, public policy, or academic journals.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Secure Sandboxing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Active rating against SQLi/XSS scripts with sandboxed, safe claim scanning.
          </p>
        </div>
      </section>
    </div>
  );
}
