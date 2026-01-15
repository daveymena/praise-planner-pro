import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './config/database.js';

import jwt from 'jsonwebtoken';
// Import routes
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import songsRoutes from './routes/songs.js';
import rehearsalsRoutes from './routes/rehearsals.js';
import servicesRoutes from './routes/services.js';
import rulesRoutes from './routes/rules.js';
import aiRoutes from './routes/ai.js';
import proxyRoutes from './routes/proxy.js';

import { runMigrations } from './migrations/migrate.js';

dotenv.config();

const app = express();

// Auth Middleware (Isolated for SaaS)
const authMiddleware = (req, res, next) => {
  // Public routes: Allow non-API routes (frontend), health check, and auth endpoints
  // Public routes: Allow non-API routes, health check, auth, and proxy
  if (
    !req.path.startsWith('/api') ||
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/proxy') ||
    req.path === '/health'
  ) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-worship-key');
    req.user = decoded; // { id, ministryId, role }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
// Enable trust proxy for EasyPanel/Traefik
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3003", "https://ollama-app-ministerio-alabanza.ginee6.easypanel.host"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased for active development and testing
  message: { error: 'Demasiadas solicitudes, por favor intenta más tarde' }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply Auth Middleware
app.use(authMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      message: 'Praise Planner Pro API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/rehearsals', rehearsalsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/proxy', proxyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Serve static content (Frontend)
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler for API routes ONLY
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// SPA Fallback - Serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const startServer = async () => {
  try {
    // Run migrations before starting server
    if (process.env.NODE_ENV === 'production' || process.env.RUN_MIGRATIONS === 'true') {
      await runMigrations();
    }

    app.listen(PORT, () => {
      console.log('🚀 Praise Planner Pro Server started');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('🎵 Ready to serve the ministry!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;