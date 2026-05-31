import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  BarChart3, ShieldCheck, AlertCircle, Sparkles, Flame, CheckCircle2, 
  Search, ArrowRight, Activity
} from 'lucide-react';
import { DashboardStats, TrendingHoaxItem } from '../types';

interface TrendingDashboardProps {
  stats: DashboardStats | null;
  trendingList: TrendingHoaxItem[];
  onTriggerCheck: (text: string) => void;
}

export default function TrendingDashboard({ stats, trendingList, onTriggerCheck }: TrendingDashboardProps) {
  
  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center" id="dashboard-loading-box">
        <Activity className="h-8 w-8 text-emerald-400 animate-spin" />
        <span className="text-sm text-slate-400 ml-2">Loading core research metrics...</span>
      </div>
    );
  }

  // Formatting Pie Chart labels
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-mono font-bold">
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  const statusColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10" id="analytics-overview-deck">
      
      {/* Visual Hub Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-white tracking-tight flex items-center space-x-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <span>Misinformation Index & Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track trending fact-check statistics, hoax classifications, and viral community alerts worldwide.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 font-mono text-xs">
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>System Load: SECURE</span>
        </div>
      </div>

      {/* 1. CORE METRIC NUMERIC SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-dashboard-grid">
        
        {/* Total Claims */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Claims Audited</span>
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">{stats.totalClaimsChecked}</p>
          <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">100% Secure</span>
            <span>• Verified via Grounded API</span>
          </div>
        </div>

        {/* Hoaxes Detected */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Hoaxes Confirmed</span>
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-rose-400">{stats.hoaxesDetected}</p>
          <div className="text-[10px] text-slate-500 font-mono">
            <span>Criticality Ratio: </span>
            <span className="text-rose-400 font-bold">
              {stats.totalClaimsChecked > 0 ? Math.round((stats.hoaxesDetected / stats.totalClaimsChecked) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* High Risk Counter */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Bio/Fin Threat Alert</span>
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-amber-400">{stats.criticalRisks}</p>
          <div className="text-[10px] text-slate-500 font-mono">
            <span>Severe misinformation categories</span>
          </div>
        </div>

        {/* Average Credibility */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Credibility Weight</span>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">{stats.averageCredibility}%</p>
          <div className="text-[10px] text-slate-500 font-mono">
            <span>General index of checked articles</span>
          </div>
        </div>

      </section>

      {/* 2. RESPONSIVE GRAPH MATRICS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-graphs-mesh">
        
        {/* Weekly Histograms Comparison */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/30 p-5 md:p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-200 mb-6 flex items-center space-x-1.5">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span>Weekly Fact Checking Histogram</span>
          </h3>

          <div className="h-64 sm:h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111111" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#22c55e', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="checked" name="Audited Claims" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hoaxes" name="Hoaxes flag" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Classification Pie Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 md:p-6 backdrop-blur-md flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Categorical Distribution</span>
          </h3>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={75}
                  fill="#22c55e"
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000000', borderColor: '#22c55e', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/60 font-sans text-[10px]">
            {stats.categoryDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-slate-400">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. DYNAMIC MISINFORMATION LIST */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-white font-serif">Viral claims Watch-list</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="viral-watch-grid">
          {trendingList.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 hover:bg-slate-900/40 hover:border-slate-700 transition"
              id={`trending-hoax-item-${item.id}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-mono border px-2 py-0.5 rounded uppercase leading-none ${statusColors[item.status]}`}>
                      {item.status} Virality
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">VIRALITY WAVE</span>
                  <span className="text-lg font-bold text-rose-500 font-mono tracking-tighter">{item.viralityScore}%</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">Checked {item.checkedCount} times</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-4">
                <span className="text-[10px] text-rose-400 font-mono">
                  Hoax Rate: {item.hoaxProbability}%
                </span>
                
                <button
                  onClick={() => onTriggerCheck(item.title)}
                  className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold group transition"
                >
                  <span>Re-Scan Topic</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
