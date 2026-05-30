import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbInstance } from './server/db.js';
import { factCheckClaim, factCheckImage } from './server/geminiService.js';

// Define custom Express Request extensions in-place for ease of use
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // XSS & Simple payload sanitation helper
  const sanitizeInput = (text: string): string => {
    if (!text) return '';
    return text
      .trim()
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
      .replace(/javascript:/gi, '') // Strip script protocol
      .replace(/onload/gi, 'no-load')
      .replace(/onerror/gi, 'no-err');
  };

  // Middlewares
  app.use(express.json({ limit: '20mb' })); // Increase limit for screenshot image upload
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Request logs and security filter
  app.use((req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);
    
    // SQL Injection pattern blocks
    const queryStr = JSON.stringify(req.query) + JSON.stringify(req.body);
    if (/('|--|union|select|insert|delete|drop|update).*?('|--|union|select|insert)/gi.test(queryStr)) {
      dbInstance.addSystemLog('warn', `Suspicious database parameters blocked from IP: ${ip}`, ip);
      res.status(400).json({ error: 'Security Exception: Malformed request variables detected.' });
      return;
    }
    next();
  });

  // Client Session Middleware (Simulating NextAuth / simple auth state via headers)
  app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const email = authHeader.replace('Bearer ', '').trim();
      const user = dbInstance.findUserByEmail(email);
      if (user) {
        req.user = user;
      }
    }

    // Default fallback to Admin account so app starts with beautiful populated history immediately
    if (!req.user) {
      const defaultAdmin = dbInstance.findUserById('admin-1');
      if (defaultAdmin) {
        req.user = defaultAdmin;
      }
    }
    next();
  });

  // RATE LIMIT SIMULATOR
  const ipHits: Record<string, { count: number; resetAt: number }> = {};
  const rateLimit = (maxRequests: number, durationMs: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);
      const now = Date.now();

      if (!ipHits[ip] || now > ipHits[ip].resetAt) {
        ipHits[ip] = { count: 1, resetAt: now + durationMs };
        return next();
      }

      ipHits[ip].count++;
      if (ipHits[ip].count > maxRequests) {
        return res.status(429).json({ error: 'Too many requests. Please throttle verification claims.' });
      }
      next();
    };
  };

  // ==========================================
  // AUTHENTICATION API ROUTES
  // ==========================================

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required fields.' });
      return;
    }

    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(name);

    const existingUser = dbInstance.findUserByEmail(cleanEmail);
    if (existingUser) {
      res.status(400).json({ error: 'This email is already registered.' });
      return;
    }

    const newUser = dbInstance.createUser({
      name: cleanName,
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'user'
    });

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);
    dbInstance.addSystemLog('info', `User registered successfully: ${newUser.email}`, ip);

    res.json(newUser);
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const cleanEmail = sanitizeInput(email);
    let user = dbInstance.findUserByEmail(cleanEmail);

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);

    // If user doesn't exist, we auto-create them as a convenience for testing
    if (!user) {
      const parts = cleanEmail.split('@')[0];
      const nickname = parts.charAt(0).toUpperCase() + parts.slice(1);
      user = dbInstance.createUser({
        name: nickname,
        email: cleanEmail,
        role: cleanEmail.includes('admin') ? 'admin' : 'user'
      });
      dbInstance.addSystemLog('info', `Auto-registered user during login: ${cleanEmail}`, ip);
    } else {
      dbInstance.addSystemLog('info', `User logged in successfully: ${cleanEmail}`, ip);
    }

    res.json(user);
  });

  // ==========================================
  // METRICS & ANALYSIS API ROUTES
  // ==========================================

  app.get('/api/dashboard', (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || 'admin-1';
    const stats = dbInstance.getDashboardStats(userId);
    res.json(stats);
  });

  app.get('/api/trending', (req: Request, res: Response) => {
    const trendings = dbInstance.getTrendingHoaxes();
    res.json(trendings);
  });

  // CLAIM VERIFICATION (FACT-CHECK) MAIN ROUTE
  app.post('/api/verify', rateLimit(10, 60000), async (req: AuthenticatedRequest, res: Response) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      res.status(400).json({ error: 'Please type or paste a valid claim or news story (minimum 5 characters).' });
      return;
    }

    const cleanedClaim = sanitizeInput(text);
    const userId = req.user?.id || 'admin-1';

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);

    try {
      dbInstance.addSystemLog('info', `Fact-checking claim size ${cleanedClaim.length} chars`, ip);
      
      const analysisResult = await factCheckClaim(cleanedClaim);
      const finalRecord = dbInstance.addCheck(userId, analysisResult);

      res.json(finalRecord);
    } catch (err: any) {
      console.error('Fact checking process failure:', err);
      dbInstance.addSystemLog('error', `Fact checker failed: ${err.message || 'Unknown error'}`, ip);
      res.status(500).json({
        error: 'The Gemini artificial intelligence analysis has timed out or failed. Check that your GEMINI_API_KEY is configured correctly.'
      });
    }
  });

  // IMAGE OCR FACT CHECKING
  app.post('/api/verify-image', rateLimit(10, 60000), async (req: AuthenticatedRequest, res: Response) => {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'Invalid file payload or missing file format.' });
      return;
    }

    // strip base64 prefix if client sends it
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const userId = req.user?.id || 'admin-1';

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);

    try {
      dbInstance.addSystemLog('info', `Image OCR analysis received. Mime: ${mimeType}`, ip);

      const analysisResult = await factCheckImage(cleanBase64, mimeType);
      
      // Save base64 image URL partially to show in history (optional truncate for size)
      const saveUrl = imageBase64.length < 500000 ? imageBase64 : `data:${mimeType};base64,${cleanBase64.substring(0, 5000)}...truncated`;
      const finalResult = dbInstance.addCheck(userId, {
        ...analysisResult,
        imageUrl: saveUrl
      });

      res.json(finalResult);
    } catch (err: any) {
      console.error('Image fact checking process failure:', err);
      dbInstance.addSystemLog('error', `OCR Visual Checker failed: ${err.message || 'Unknown error'}`, ip);
      res.status(500).json({
        error: 'The multimodal Gemini visual text extractor could not read the screenshot correctly. Please try a cleaner snapshot or key in the text manually.'
      });
    }
  });

  // USER HISTORY MANAGEMENT
  app.get('/api/history', (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || 'admin-1';
    const checks = dbInstance.getChecks(userId);
    res.json(checks);
  });

  app.delete('/api/history/:id', (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || 'admin-1';
    const { id } = req.params;
    const success = dbInstance.deleteCheck(id, userId);

    if (success) {
      res.json({ message: 'Historical review item deleted successfully from your logging list.' });
    } else {
      res.status(404).json({ error: 'Selected items could not be located or deletion unauthorized.' });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD SUPERVISION API
  // ==========================================

  app.get('/api/admin/metrics', (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Restricted Access: Administrative permissions required.' });
      return;
    }

    const logs = dbInstance.getSystemLogs();
    const allChecks = dbInstance.getAllChecksAdmin();
    const users = dbInstance.getUsers();
    const popularSearches = dbInstance.getPopularSearches();

    res.json({
      logs,
      allChecks,
      users,
      popularSearches
    });
  });

  app.post('/api/admin/action', (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Restricted Access: Administrative permissions required.' });
      return;
    }

    const { actionType, targetId, category, text } = req.body;
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp as string);

    if (actionType === 'delete_check') {
      const removed = dbInstance.deleteCheck(targetId);
      dbInstance.addSystemLog('warn', `Admin deleted review record ID: ${targetId}`, ip);
      res.json({ success: removed, message: 'Review successfully removed.' });
      return;
    }

    if (actionType === 'add_trend') {
      if (!text || !category) {
        res.status(400).json({ error: 'Trend headline and category are required.' });
        return;
      }
      const newTrend = dbInstance.addTrendingHoax({
        title: text,
        category,
        viralityScore: Math.floor(Math.random() * 30) + 70,
        hoaxProbability: Math.floor(Math.random() * 30) + 70,
        status: 'warning',
        checkedCount: 1,
        description: 'Admin supplied misinformation bulletin.'
      });
      dbInstance.addSystemLog('info', `Admin registered trending watch: ${text}`, ip);
      res.json({ success: true, trend: newTrend });
      return;
    }

    if (actionType === 'delete_trend') {
      const removed = dbInstance.deleteTrendingHoax(targetId);
      dbInstance.addSystemLog('warn', `Admin deleted trending wave ID: ${targetId}`, ip);
      res.json({ success: removed });
      return;
    }

    res.status(400).json({ error: 'Specified administrative action unrecognized.' });
  });

  // ==========================================
  // VITE COMPILATION MIDDLEWARE OR STATIC FILES
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HoaxLens AI full-stack node server running dynamically on http://localhost:${PORT}`);
  });
}

startServer();
