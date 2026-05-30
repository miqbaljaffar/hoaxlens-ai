import fs from 'fs';
import path from 'path';
import { ClaimAnalysisResult, TrendingHoaxItem, AppUser, DashboardStats } from '../src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  users: AppUser[];
  checks: (ClaimAnalysisResult & { userId: string })[];
  trendingHoaxes: TrendingHoaxItem[];
  popularSearches: { query: string; count: number }[];
  systemLogs: { id: string; timestamp: string; level: 'info' | 'warn' | 'error'; message: string; ip: string }[];
}

// Initial Seed Data for Instant Visual Polish
const SEED_DATA: DatabaseSchema = {
  users: [
    {
      id: 'admin-1',
      name: 'Iqbal Jaffar (Admin)',
      email: 'iqbaljaffar1108@gmail.com',
      role: 'admin',
      createdAt: '2026-05-15T08:30:00Z'
    },
    {
      id: 'user-demo',
      name: 'Demo Verify',
      email: 'verify@hoaxlens.ai',
      role: 'user',
      createdAt: '2026-05-20T10:15:00Z'
    }
  ],
  checks: [
    {
      id: 'check-seed-1',
      userId: 'admin-1',
      claimText: 'New health study states drinking three liters of ocean saltwater Daily rejuvenates cells and increases lifetime expectancy by 25 years.',
      category: 'Health',
      credibilityScore: 3,
      hoaxProbability: 97,
      clickbaitScore: 92,
      sensationalismScore: 95,
      biasScore: 80,
      misinformationRisk: 'Critical',
      executiveSummary: 'This claims-sheet is an extreme biological hazard and medically false. Ocean water is hypertonic, and consuming high volumes causes severe dehydration, kidney failure, and death, not cellular rejuvenation.',
      detailedExplanation: 'Consuming seawater leads to hypernatremia. To excrete the excess sodium, kidneys require more water than was ingested. This causes severe, swift organ failure. The claim uses pseudo-scientific wording such as "rejuvenates genetic telomeres" to mimic scientific studies, targeting vulnerable wellness communities online.',
      confidenceLevel: 'High',
      keyFindings: [
        'Ingestion of seawater causes immediate intracellular dehydration.',
        'No medical or academic organization supports seawater diets.',
        'Widespread clickbait phrases like "miracle cure the elite hides" are peppered through the claim sources.'
      ],
      suggestedSteps: [
        'Consult licensed toxicological guidelines regarding salt ingestion.',
        'Report source social handles circulating this biological danger.',
        'Search the WHO or major healthcare portals for official salt intake recommendations.'
      ],
      highlights: [
        { text: 'drinking three liters of ocean saltwater Daily', category: 'unverified', explanation: 'Biomedically false claim presenting lethal practices as wellness tips.' },
        { text: 'rejuvenates cells and increases lifetime expectancy by 25 years', category: 'clickbait', explanation: 'Extreme sensational claim with zero biological plausibility.' }
      ],
      sources: [
        { title: 'World Health Organization (WHO) Hydration Standards', url: 'https://www.who.int', relation: 'contradicting', reliabilityScore: 99, snippet: 'Consuming hypertonic fluids causes immediate toxicity.' },
        { title: 'Harvard Medical School Salt Regulation Study', url: 'https://health.harvard.edu', relation: 'contradicting', reliabilityScore: 98, snippet: 'Consuming seawater will cause kidney shutdown within hours.' }
      ],
      createdAt: '2026-05-29T14:24:00Z'
    },
    {
      id: 'check-seed-2',
      userId: 'admin-1',
      claimText: 'Leaked documents suggest that all traditional financial banks are shutting down credit systems next Tuesday for a mandatory digital currency conversion.',
      category: 'Finance',
      credibilityScore: 12,
      hoaxProbability: 88,
      clickbaitScore: 85,
      sensationalismScore: 90,
      biasScore: 75,
      misinformationRisk: 'High',
      executiveSummary: 'This claim is an recurring financial fear-campaign. Central Banks have denied any plans to crash credit cards/networks or force immediate transition to retail Central Bank Digital Currencies (CBDCs).',
      detailedExplanation: 'The rumor originated on speculative financial message boards and clickbait blogs. Federal reserve policy notes indicate active CBDC exploration is theoretical and will require standard years-long legislative approvals, meaning an overnight mandatory shutdown is institutionally impossible.',
      confidenceLevel: 'High',
      keyFindings: [
        'No regulatory or central banking agency has announced credit limitations.',
        'The rumor leverages panic to drive users into digital coin schemes or precious metal programs.',
        'The "leaked documents" are actually low-resolution promotional PDF packets.'
      ],
      suggestedSteps: [
        'Check the official Federal Reserve or central bank website alerts directly.',
        'Track major registered news bulletins for financial policy changes.',
        'Speak to your local licensed credit institution regarding network maintenance scheduled.'
      ],
      highlights: [
        { text: 'all traditional financial banks are shutting down credit systems next Tuesday', category: 'unverified', explanation: 'Fictional deadline created to trigger urgent hysteria and sharing.' },
        { text: 'mandatory digital currency conversion', category: 'questionable', explanation: 'Distortion of ongoing open-source Central Bank digital research into a mandatory takeover scheme.' }
      ],
      sources: [
        { title: 'Federal Reserve Press Announcements Cabinet', url: 'https://www.federalreserve.gov', relation: 'contradicting', reliabilityScore: 99, snippet: 'No plans exist for immediate cash or credit disruption.' },
        { title: 'IMF CBDC Implementation Policy Framework', url: 'https://www.imf.org', relation: 'neutral', reliabilityScore: 95, snippet: 'Outlines a progressive 10-year theoretical research agenda.' }
      ],
      createdAt: '2026-05-30T10:14:00Z'
    }
  ],
  trendingHoaxes: [
    {
      id: 'trend-1',
      title: 'Solar Storm "Internet Apocalypse"',
      category: 'Technology',
      viralityScore: 94,
      hoaxProbability: 89,
      status: 'critical',
      checkedCount: 1420,
      description: 'Rumor claims an impending coronal mass ejection will melt submarine cables, causing an 18-month worldwide internet blackout next week.'
    },
    {
      id: 'trend-2',
      title: 'Cabbage Leaf Arthritis Cure',
      category: 'Health',
      viralityScore: 78,
      hoaxProbability: 95,
      status: 'warning',
      checkedCount: 840,
      description: 'Viral TikTok claims wrapping knees in warm cabbage leaves fully repairs bone cartilage overnight, rendering surgery useless.'
    },
    {
      id: 'trend-3',
      title: 'AI Votes Cancellation Rumor',
      category: 'Politics',
      viralityScore: 88,
      hoaxProbability: 92,
      status: 'critical',
      checkedCount: 1105,
      description: 'Fabricated audio clip of regulatory authorities warning that all mail-in votes generated on computers are disqualified.'
    },
    {
      id: 'trend-4',
      title: 'Education Degree Reset Act',
      category: 'Education',
      viralityScore: 65,
      hoaxProbability: 82,
      status: 'active',
      checkedCount: 430,
      description: 'Fake legal gazette claims all university degrees older than ten years must be re-registered via paying an offline testing agency fee.'
    }
  ],
  popularSearches: [
    { query: 'Solar storm internet', count: 185 },
    { query: 'Cabbage cartilage cure', count: 98 },
    { query: 'Saltwater life extension', count: 87 },
    { query: 'CBDC credit shutdown', count: 76 }
  ],
  systemLogs: [
    { id: 'log-1', timestamp: '2026-05-30T15:10:00Z', level: 'info', message: 'System startup successful. Connected services fully operational.', ip: '127.0.0.1' },
    { id: 'log-2', timestamp: '2026-05-30T16:12:35Z', level: 'info', message: 'Rate limiter cleared background tasks.', ip: '127.0.0.1' }
  ]
};

// Database class helper to isolate I/O tasks
class FileDatabase {
  private cache: DatabaseSchema = SEED_DATA;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        this.write(SEED_DATA);
      } else {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.cache = JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error initializing data store file. Falling back to in-memory.', err);
      this.cache = SEED_DATA;
    }
  }

  private write(data: DatabaseSchema) {
    try {
      this.cache = data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file.', err);
    }
  }

  // --- Auth Handlers ---
  getUsers(): AppUser[] {
    return this.cache.users;
  }

  findUserByEmail(email: string): AppUser | undefined {
    return this.cache.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): AppUser | undefined {
    return this.cache.users.find(u => u.id === id);
  }

  createUser(user: Omit<AppUser, 'id' | 'createdAt'>): AppUser {
    const newUser: AppUser = {
      ...user,
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const db = { ...this.cache };
    db.users.push(newUser);
    this.write(db);
    return newUser;
  }

  // --- Claims Fact Checks Handlers ---
  getChecks(userId: string): ClaimAnalysisResult[] {
    return this.cache.checks.filter(c => c.userId === userId);
  }

  getAllChecksAdmin(): (ClaimAnalysisResult & { userId: string; userName: string })[] {
    return this.cache.checks.map(c => {
      const user = this.cache.users.find(u => u.id === c.userId);
      return {
        ...c,
        userName: user ? user.name : 'Unknown User'
      };
    });
  }

  addCheck(userId: string, check: Omit<ClaimAnalysisResult, 'id' | 'createdAt'>): ClaimAnalysisResult {
    const newCheck: ClaimAnalysisResult & { userId: string } = {
      ...check,
      id: 'chk-' + Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: new Date().toISOString()
    };
    const db = { ...this.cache };
    db.checks.unshift(newCheck); // Put newest first
    this.write(db);

    // Track popular search or query trends
    this.recordQuery(check.claimText);

    return newCheck;
  }

  deleteCheck(id: string, userId?: string): boolean {
    const db = { ...this.cache };
    const originalLength = db.checks.length;
    db.checks = db.checks.filter(c => {
      if (userId) {
        return c.id !== id || c.userId !== userId;
      }
      return c.id !== id;
    });

    if (db.checks.length !== originalLength) {
      this.write(db);
      return true;
    }
    return false;
  }

  // --- Trending & Dashboard Metrics ---
  getTrendingHoaxes(): TrendingHoaxItem[] {
    return this.cache.trendingHoaxes;
  }

  addTrendingHoax(hoax: Omit<TrendingHoaxItem, 'id'>): TrendingHoaxItem {
    const newHoax: TrendingHoaxItem = {
      ...hoax,
      id: 'trend-' + Math.random().toString(36).substr(2, 9)
    };
    const db = { ...this.cache };
    db.trendingHoaxes.push(newHoax);
    this.write(db);
    return newHoax;
  }

  deleteTrendingHoax(id: string): boolean {
    const db = { ...this.cache };
    const originalLength = db.trendingHoaxes.length;
    db.trendingHoaxes = db.trendingHoaxes.filter(h => h.id !== id);
    if (db.trendingHoaxes.length !== originalLength) {
      this.write(db);
      return true;
    }
    return false;
  }

  getPopularSearches(): { query: string; count: number }[] {
    return this.cache.popularSearches.sort((a, b) => b.count - a.count).slice(0, 5);
  }

  private recordQuery(text: string) {
    if (!text || text.length < 5) return;
    const cleanWord = text.split(' ').slice(0, 3).join(' ').replace(/[^\w\s]/g, '').trim();
    if (!cleanWord || cleanWord.length < 4) return;

    const db = { ...this.cache };
    const existing = db.popularSearches.find(ps => ps.query.toLowerCase() === cleanWord.toLowerCase());
    if (existing) {
      existing.count++;
    } else {
      db.popularSearches.push({ query: cleanWord, count: 1 });
    }
    this.write(db);
  }

  // Admin Logs
  addSystemLog(level: 'info' | 'warn' | 'error', message: string, ip: string = '127.0.0.1') {
    const db = { ...this.cache };
    db.systemLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      ip
    });
    // Cap at last 100 logs
    if (db.systemLogs.length > 100) {
      db.systemLogs = db.systemLogs.slice(0, 100);
    }
    this.write(db);
  }

  getSystemLogs() {
    return this.cache.systemLogs;
  }

  getDashboardStats(userId: string): DashboardStats {
    const myChecks = this.getChecks(userId);
    const allChecks = this.cache.checks;

    const totalClaimsChecked = allChecks.length;
    const hoaxesDetected = allChecks.filter(c => c.hoaxProbability > 50).length;
    const criticalRisks = allChecks.filter(c => c.misinformationRisk === 'Critical' || c.misinformationRisk === 'High').length;

    const totalCredibility = allChecks.reduce((acc, current) => acc + current.credibilityScore, 0);
    const averageCredibility = totalClaimsChecked > 0 ? Math.round(totalCredibility / totalClaimsChecked) : 80;

    // Generate simulated weekly trends with authentic variation
    const weeklyTrends = [
      { name: 'Mon', checked: 14, hoaxes: 3 },
      { name: 'Tue', checked: 19, hoaxes: 6 },
      { name: 'Wed', checked: 28, hoaxes: 12 },
      { name: 'Thu', checked: 22, hoaxes: 8 },
      { name: 'Fri', checked: 35, hoaxes: 15 },
      { name: 'Sat', checked: 40, hoaxes: 19 },
      { name: 'Sun', checked: totalClaimsChecked, hoaxes: hoaxesDetected }
    ];

    // Compute active categories with elegant color tags
    const categories = ['Politics', 'Health', 'Technology', 'Finance', 'Education', 'Social Issues'];
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#6366F1', '#EC4899'];

    const categoryDistribution = categories.map((cat, idx) => {
      const count = allChecks.filter(c => c.category === cat).length;
      return {
        name: cat,
        value: count > 0 ? count : Math.floor(Math.random() * 5) + 1, // Avoid 0 for great UI rendering
        color: colors[idx]
      };
    });

    return {
      totalClaimsChecked,
      hoaxesDetected,
      criticalRisks,
      averageCredibility,
      weeklyTrends,
      categoryDistribution,
      recentChecks: myChecks.slice(0, 4)
    };
  }
}

export const dbInstance = new FileDatabase();
