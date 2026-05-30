import React, { useState, useEffect } from 'react';
import { 
  Users, Terminal, Trash2, ShieldAlert, Cpu, 
  Plus, Play, AlertTriangle, CloudRain, Lock, Activity, Ban
} from 'lucide-react';

interface LogItem {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  ip: string;
}

interface AllUserCheckItem {
  id: string;
  claimText: string;
  category: string;
  credibilityScore: number;
  hoaxProbability: number;
  misinformationRisk: string;
  userName: string;
  createdAt: string;
}

interface AdminStats {
  logs: LogItem[];
  allChecks: AllUserCheckItem[];
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
  popularSearches: { query: string; count: number }[];
}

interface AdminPanelProps {
  currentUser: { id: string; name: string; email: string; role: string; createdAt: string } | null;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [newTrendText, setNewTrendText] = useState('');
  const [newTrendCategory, setNewTrendCategory] = useState('Politics');
  const [isSubmittingTrend, setIsSubmittingTrend] = useState(false);
  const [systemSafetyMode, setSystemSafetyMode] = useState(true);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${currentUser?.email}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading administrative analytics:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminStats();
    }
  }, [currentUser]);

  const handleDeleteCheckByAdmin = async (id: string) => {
    try {
      const response = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.email}`
        },
        body: JSON.stringify({
          actionType: 'delete_check',
          targetId: id
        })
      });

      if (response.ok) {
        // reload
        fetchAdminStats();
      }
    } catch (err) {
      console.error('Admin actions fail:', err);
    }
  };

  const handleAddTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrendText.trim().length < 5) return;

    setIsSubmittingTrend(true);
    try {
      const response = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.email}`
        },
        body: JSON.stringify({
          actionType: 'add_trend',
          text: newTrendText,
          category: newTrendCategory
        })
      });

      if (response.ok) {
        setNewTrendText('');
        fetchAdminStats();
        alert('Trending Watch Bulletin Registered Successfully on the Dashboard!');
      }
    } catch (err) {
      console.error('Trend submission failed:', err);
    } finally {
      setIsSubmittingTrend(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4" id="forbidden-alert">
        <Lock className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="text-xl font-bold text-slate-200">Restricted Administration Cabin</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This system uses role-based security configurations. Please toggle your test account to "Admin" in the navbar section to view administrative logging panels.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10" id="admin-workbench">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-6 gap-4">
        <div className="text-left">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            ROLE: SUPER USER OPERATIONAL SYSTEM
          </span>
          <h2 className="text-3xl font-bold font-serif text-white tracking-tight mt-1.5 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-emerald-400" />
            <span>Operational Admin Cabinet</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Monitor real-time security alerts, purge abusive scans, view IP logs, and inject viral bulletins.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSystemSafetyMode(!systemSafetyMode)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              systemSafetyMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Security Shield: {systemSafetyMode ? 'ON (BLOCKING)' : 'OFF (AUDIT-ONLY)'}</span>
          </button>
        </div>
      </div>

      {/* 1. SECTOR METRICS CARD GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-2">
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Users Registered</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold text-white">{stats?.users.length || 0}</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-2">
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">System Audit Trials</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold text-white">{stats?.allChecks.length || 0}</span>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-2">
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Security Flags blocked</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold text-amber-400">
              {stats?.logs.filter(l => l.level === 'warn' || l.level === 'error').length || 0}
            </span>
            <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-2">
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Model cognitive Engine</p>
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-slate-300">GEMINI-3.5-FLASH</span>
            <Cpu className="h-5 w-5 text-emerald-400" />
          </div>
        </div>

      </section>

      {/* 2. DUAL LAYOUT SECS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Terminal real-time IP log screen (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950 p-6 flex flex-col h-[400px]">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-emerald-400 animate-ping" />
            <span>Interactive Audit SysLog Terminal</span>
          </h3>

          <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[9px] text-emerald-500 overflow-y-auto space-y-2 scrollbar-thin">
            {stats && stats.logs.length > 0 ? (
              stats.logs.map((log) => (
                <div key={log.id} className="flex gap-2 items-start leading-tight">
                  <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-bold ${
                    log.level === 'error' ? 'text-rose-500' : log.level === 'warn' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-bold shrink-0">IP: {log.ip}</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No operational telemetry recorded.</p>
            )}
          </div>
        </div>

        {/* Action console: inject standard claims */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-5 flex items-center space-x-1.5">
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Deploy Viral Claims Bulletin</span>
          </h3>

          <form onSubmit={handleAddTrend} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Headline Text</label>
              <textarea
                value={newTrendText}
                onChange={(e) => setNewTrendText(e.target.value)}
                placeholder="Alert text regarding viral rumors..."
                rows={3}
                className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-3 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Topic Category</label>
              <select
                value={newTrendCategory}
                onChange={(e) => setNewTrendCategory(e.target.value)}
                className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-2 text-slate-300"
              >
                {['Politics', 'Health', 'Technology', 'Finance', 'Education', 'Social Issues'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmittingTrend || newTrendText.trim().length < 5}
              className="w-full py-2.5 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs transition duration-200"
            >
              Deploy Bulletin Board →
            </button>
          </form>
        </div>

      </section>

      {/* 3. FULL DATA CONTROL SECTION: AUDITED CHECKS ACROSS ALL USERS WITH DELETE POWER */}
      <section className="rounded-2xl border border-slate-950 bg-slate-950 p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-6 font-serif flex items-center space-x-1.5">
          <Users className="h-5 w-5 text-indigo-400" />
          <span>General Claims Security Supervisor</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-900 pb-3 text-slate-500 font-mono">
                <th className="py-3 font-semibold uppercase">Verify Date</th>
                <th className="py-3 font-semibold uppercase">Verification User</th>
                <th className="py-3 font-semibold uppercase">Claim Content Check</th>
                <th className="py-3 font-semibold uppercase">Category</th>
                <th className="py-3 font-semibold uppercase">Metrics</th>
                <th className="py-3 font-semibold uppercase text-right">Operational purge</th>
              </tr>
            </thead>
            <tbody>
              {stats && stats.allChecks.length > 0 ? (
                stats.allChecks.map((check) => (
                  <tr key={check.id} className="border-b border-slate-900/40 hover:bg-slate-900/20 transition">
                    <td className="py-3 text-slate-400 font-mono font-medium">
                      {new Date(check.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-slate-200 font-semibold">{check.userName}</td>
                    <td className="py-3 text-slate-400 max-w-sm truncate leading-snug">
                      "{check.claimText}"
                    </td>
                    <td className="py-3">
                      <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                        {check.category}
                      </span>
                    </td>
                    <td className="py-3 font-mono">
                      <div className="flex flex-col">
                        <span className="text-rose-400 font-semibold">Hoax: {check.hoaxProbability}%</span>
                        <span className="text-emerald-400 font-semibold">Cred: {check.credibilityScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteCheckByAdmin(check.id)}
                        className="p-1 px-2.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                        title="Purge completely"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-600 font-medium">
                    No claim verifications logged in data files.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
