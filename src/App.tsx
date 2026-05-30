import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import FactChecker from './components/FactChecker';
import OcrChecker from './components/OcrChecker';
import TrendingDashboard from './components/TrendingDashboard';
import HistoryArchive from './components/HistoryArchive';
import AdminPanel from './components/AdminPanel';
import { ClaimAnalysisResult, TrendingHoaxItem, DashboardStats, AppUser } from './types';
import { ShieldCheck, User, LogIn, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // App core variables
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<ClaimAnalysisResult | null>(null);
  const [historyList, setHistoryList] = useState<ClaimAnalysisResult[]>([]);
  const [trendingList, setTrendingList] = useState<TrendingHoaxItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  // Simulated Dialog state for sandbox auth selection
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [loginEmailInput, setLoginEmailInput] = useState('');

  // 1. Initial Data Fetching from Server
  const loadDatabaseAssets = async (userEmail?: string) => {
    const headers: Record<string, string> = {};
    if (userEmail) {
      headers['Authorization'] = `Bearer ${userEmail}`;
    } else if (currentUser) {
      headers['Authorization'] = `Bearer ${currentUser.email}`;
    }

    try {
      // 1. Fetch history logs
      const historyRes = await fetch('/api/history', { headers });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistoryList(historyData);
      }

      // 2. Fetch active statistics
      const dashboardRes = await fetch('/api/dashboard', { headers });
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboardStats(dashboardData);
      }

      // 3. Fetch trending lists
      const trendingRes = await fetch('/api/trending');
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        setTrendingList(trendingData);
      }
    } catch (err) {
      console.error('Error fetching dynamic database assets:', err);
    }
  };

  // Run initial setups
  useEffect(() => {
    // Attempt standard sign-in for Iqbal Jaffar default Admin
    const prebakedAdminEmail = 'iqbaljaffar1108@gmail.com';
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: prebakedAdminEmail })
        });
        if (res.ok) {
          const defaultAdmin = await res.json();
          setCurrentUser(defaultAdmin);
          loadDatabaseAssets(defaultAdmin.email);
        }
      } catch (err) {
        console.error('Core auto login failed', err);
        // Fallback layout initialization
        loadDatabaseAssets();
      }
    };

    initAuth();
  }, []);

  // 2. Fact Check Actions
  const handleAnalyzeText = async (claimText: string) => {
    setIsLoading(true);
    // Switch immediately to Fact-Checker to show progressive loading
    setActiveTab('checker');
    setCurrentResult(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser ? `Bearer ${currentUser.email}` : ''
        },
        body: JSON.stringify({ text: claimText })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || 'Server error occurred during verification.');
      }

      const verifiedResult = await response.json();
      setCurrentResult(verifiedResult);
      
      // Reload assets
      loadDatabaseAssets();
    } catch (err: any) {
      alert(err.message || 'The scan has timed out or failed. Please check your system endpoints.');
      setActiveTab('landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeImage = async (base64Content: string, mimeType: string) => {
    setIsLoading(true);
    setActiveTab('checker');
    setCurrentResult(null);

    try {
      const response = await fetch('/api/verify-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser ? `Bearer ${currentUser.email}` : ''
        },
        body: JSON.stringify({ imageBase64: base64Content, mimeType })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || 'Failed scanning screenshot visually.');
      }

      const verifiedResult = await response.json();
      setCurrentResult(verifiedResult);
      
      // Reload assets
      loadDatabaseAssets();
    } catch (err: any) {
      alert(err.message || 'Failed multimodal visual processing. Please ensure your image is crystal clear.');
      setActiveTab('landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`
        }
      });

      if (response.ok) {
        // Refresh local assets
        loadDatabaseAssets();
      }
    } catch (err) {
      console.error('Delete history failure:', err);
    }
  };

  const handleSelectResult = (result: ClaimAnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('checker');
  };

  // Switch User Profile Dialog callbacks
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailInput.trim().includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmailInput.trim() })
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        loadDatabaseAssets(user.email);
        setShowUserModal(false);
        setLoginEmailInput('');
      }
    } catch (err) {
      console.error('Failed mock sign-in:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistoryList([]);
    setDashboardStats(null);
  };

  // Rendering current views
  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4" id="factcheck-master-loader">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-slate-100">AI Verification Scanning Active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto tracking-wide">
              Invoking Gemini multi-agent validation, pulling Google groundings, and checking clinical/political policy cabinets...
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage 
            onAnalyze={handleAnalyzeText} 
            isLoading={isLoading} 
            setActiveTab={setActiveTab}
          />
        );
      case 'checker':
        return (
          <FactChecker 
            result={currentResult} 
            onAnalyze={handleAnalyzeText} 
            isLoading={isLoading} 
          />
        );
      case 'ocr':
        return (
          <OcrChecker 
            onCheckImage={handleAnalyzeImage} 
            isLoading={isLoading} 
          />
        );
      case 'dashboard':
        return (
          <TrendingDashboard 
            stats={dashboardStats} 
            trendingList={trendingList} 
            onTriggerCheck={handleAnalyzeText}
          />
        );
      case 'history':
        return (
          <HistoryArchive 
            historyList={historyList} 
            onSelectResult={handleSelectResult} 
            onDeleteRecord={handleDeleteRecord}
          />
        );
      case 'admin':
        return (
          <AdminPanel currentUser={currentUser} />
        );
      default:
        return (
          <LandingPage 
            onAnalyze={handleAnalyzeText} 
            isLoading={isLoading} 
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* BRAND HEADER BAR */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onSwitchUser={() => setShowUserModal(true)}
      />

      {/* PRIMARY FLOW DISPLAY BODY */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-12rem)] pb-24" id="main-content-flow-pane">
        {renderActiveView()}
      </main>

      {/* FOOTER METRIC INFO */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-[10px] text-slate-500 font-mono space-y-1">
        <p>© 2026 HoaxLens AI • Decentralized Veracity Verification Machine Engine</p>
        <p className="text-slate-600">Secure Sandboxed Container Port 3000 • Powered by Google Gemini-3.5-flash</p>
      </footer>

      {/* USER SWAP DIALOG MODAL (SANDBOX USER SWITCHING UTILITY) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" id="auth-modal-dialog">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative space-y-6">
            <div className="space-y-2 text-left">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                <span>Sandbox Verification Profiles</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect verification identities. Toggle roles to test administrative view logs, audit reports, or specific user histories.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Simulated Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. iqbaljaffar1108@gmail.com (Admin)"
                  value={loginEmailInput}
                  onChange={(e) => setLoginEmailInput(e.target.value)}
                  className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Keying in an email with 'admin' creates an administrative supervisor.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmailInput('iqbaljaffar1108@gmail.com');
                  }}
                  className="p-2 border border-slate-800 hover:border-emerald-500/20 rounded bg-slate-950 font-semibold text-slate-300"
                >
                  Load Iqbal (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmailInput('verify@hoaxlens.ai');
                  }}
                  className="p-2 border border-slate-800 hover:border-emerald-500/20 rounded bg-slate-950 font-semibold text-slate-300"
                >
                  Load Standard Tester
                </button>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="w-1/2 py-2 text-xs font-bold border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg transition"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition shadow"
                >
                  Apply Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
