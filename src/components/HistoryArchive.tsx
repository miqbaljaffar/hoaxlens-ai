import React, { useState } from 'react';
import { Search, Trash2, Calendar, FileText, Filter, AlertOctagon, HelpCircle, ArrowRight } from 'lucide-react';
import { ClaimAnalysisResult } from '../types';

interface HistoryArchiveProps {
  historyList: ClaimAnalysisResult[];
  onSelectResult: (record: ClaimAnalysisResult) => void;
  onDeleteRecord: (id: string) => void;
}

export default function HistoryArchive({ historyList, onSelectResult, onDeleteRecord }: HistoryArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Politics', 'Health', 'Technology', 'Finance', 'Education', 'Social Issues'];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500/30 text-yellow-400';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  // Filter history dynamically based on options
  const filteredHistory = historyList.filter((item) => {
    const matchesSearch = item.claimText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" id="claims-history-cabinet">
      
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">Audit Logging Cabinet</h2>
          <p className="text-slate-500 text-xs mt-1">Review, filter, and recall your historical AI-powered verification reviews.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          {/* Quick search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search past logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 whitespace-nowrap"
            />
          </div>

          {/* Categorical filters */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat} Projects</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* History Registry elements */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 gap-4" id="history-rows-grid">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/10 p-5 hover:bg-slate-900/30 hover:border-slate-700 transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              id={`history-row-${item.id}`}
            >
              <div className="space-y-2 text-left flex-1">
                
                {/* Meta details banner */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                    {item.category}
                  </span>
                  
                  <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded leading-none border ${getRiskBadgeColor(item.misinformationRisk)}`}>
                    {item.misinformationRisk} Risk
                  </span>
                  
                  <div className="flex items-center text-[10px] text-slate-500 font-mono">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Question Quote Text */}
                <h4 className="text-sm font-semibold text-slate-200 tracking-tight leading-snug line-clamp-2">
                  "{item.claimText}"
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 italic font-sans">
                  Verdict: {item.executiveSummary}
                </p>

                {item.ocrExtractedText && (
                  <span className="inline-flex items-center text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-mono font-bold mt-1">
                    Vision OCR Source Matches
                  </span>
                )}
              </div>

              {/* Action layout */}
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-900/60">
                <div className="flex flex-col items-start md:items-end font-mono">
                  <span className="text-[9px] text-slate-500 font-bold">Credibility Index</span>
                  <span className={`text-base font-extrabold ${
                    item.credibilityScore > 70 
                      ? 'text-emerald-400' 
                      : item.credibilityScore > 35 
                        ? 'text-amber-400' 
                        : 'text-rose-400'
                  }`}>
                    {item.credibilityScore}%
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  
                  {/* Delete Item button */}
                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    title="Remove item"
                    className="p-2 rounded bg-slate-950 border border-slate-900 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Recall review trigger */}
                  <button
                    onClick={() => onSelectResult(item)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
                  >
                    <span>Recall Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-slate-800 bg-slate-900/10" id="cabinet-empty-zero">
          <FileText className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-400">Claims Archives empty</h3>
          <p className="text-xs text-slate-500 mt-1">There are no claim checks matching your selection. Run custom scans on the home dashboard!</p>
        </div>
      )}

    </div>
  );
}
