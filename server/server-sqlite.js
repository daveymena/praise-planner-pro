import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getDatabase } from './config/sqlite-database.js';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth API
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, instruments } = req.body;
    const db = await getDatabase();

    // Check if user exists
    const existing = await db.get('SELECT id FROM members WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const instrumentsJson = JSON.stringify(instruments || []);

    const result = await db.run(`
      INSERT INTO members (name, email, password, instruments, role, is_active)
      VALUES (?, ?, ?, ?, 'member', 1)
    `, [name, email, hashedPassword, instrumentsJson]);

    const user = { id: result.lastID, name, email, role: 'member' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDatabase();

    const member = await db.get('SELECT * FROM members WHERE email = ?', [email]);
    if (!member) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Support legacy users without password (optional, or force reset)
    if (!member.password) {
      // For now, allow login if no password set? No, secure it.
      return res.status(400).json({ error: 'Usuario migrado sin contraseña. Contacte admin.' });
    }

    const validPassword = await bcrypt.compare(password, member.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = { id: member.id, name: member.name, email: member.email, role: member.role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    res.json({ user, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = await getDatabase();
    await db.get('SELECT 1');
    res.json({
      status: 'OK',
      message: 'Praise Planner Pro API is running',
      database: 'SQLite Connected',
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

// Members API
app.get('/api/members', async (req, res) => {
  try {
    const db = await getDatabase();
    const members = await db.all(`
      SELECT * FROM members 
      WHERE is_active = 1 
      ORDER BY name ASC
    `);

    // Parse instruments JSON
    const parsedMembers = members.map(member => ({
      ...member,
      instruments: member.instruments ? JSON.parse(member.instruments) : []
    }));

    res.json(parsedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Songs API
app.get('/api/songs', async (req, res) => {
  try {
    const { type, favorite, search } = req.query;
    const db = await getDatabase();

    let query = `
      SELECT s.*, m.name as created_by_name 
      FROM songs s
      LEFT JOIN members m ON s.created_by = m.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ` AND s.type = ?`;
      params.push(type);
    }

    if (favorite === 'true') {
      query += ` AND s.is_favorite = 1`;
    }

    if (search) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY s.name ASC`;

    const songs = await db.all(query, params);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET /api/songs/:id
app.get('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const song = await db.get(`
      SELECT s.*, m.name as created_by_name 
      FROM songs s
      LEFT JOIN members m ON s.created_by = m.id
      WHERE s.id = ?
    `, [id]);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// Create song
app.post('/api/songs', async (req, res) => {
  try {
    const {
      name, type, key, tempo, is_favorite, lyrics, chords,
      notes, youtube_url, duration_minutes, created_by
    } = req.body;

    const db = await getDatabase();
    const result = await db.run(`
      INSERT INTO songs (
        name, type, key, tempo, is_favorite, lyrics, chords, 
        notes, youtube_url, duration_minutes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, type, key, tempo, is_favorite ? 1 : 0, lyrics, chords, notes, youtube_url, duration_minutes, created_by]);

    const newSong = await db.get('SELECT * FROM songs WHERE id = ?', [result.lastID]);
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// Update song
app.put('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, type, key, tempo, is_favorite, lyrics, chords,
      notes, youtube_url, duration_minutes
    } = req.body;

    const db = await getDatabase();
    await db.run(`
      UPDATE songs 
      SET name = ?, type = ?, key = ?, tempo = ?, is_favorite = ?,
          lyrics = ?, chords = ?, notes = ?, youtube_url = ?, 
          duration_minutes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, type, key, tempo, is_favorite ? 1 : 0, lyrics, chords, notes, youtube_url, duration_minutes, id]);

    const updatedSong = await db.get('SELECT * FROM songs WHERE id = ?', [id]);

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Update song favorite
app.patch('/api/songs/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;

    const db = await getDatabase();
    await db.run(`
      UPDATE songs 
      SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [is_favorite ? 1 : 0, id]);

    const updatedSong = await db.get('SELECT * FROM songs WHERE id = ?', [id]);

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song favorite:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Delete song
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const result = await db.run('DELETE FROM songs WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// Rehearsals API
app.get('/api/rehearsals', async (req, res) => {
  try {
    const db = await getDatabase();
    const rehearsals = await db.all(`
      SELECT 
        r.*,
        m.name as created_by_name
      FROM rehearsals r
      LEFT JOIN members m ON r.created_by = m.id
      ORDER BY r.date DESC
    `);

    // Add empty arrays for related data (simplified version)
    const rehearsalsWithRelations = rehearsals.map(rehearsal => ({
      ...rehearsal,
      rehearsal_songs: [],
      rehearsal_attendance: []
    }));

    res.json(rehearsalsWithRelations);
  } catch (error) {
    console.error('Error fetching rehearsals:', error);
    res.status(500).json({ error: 'Failed to fetch rehearsals' });
  }
});

// Upcoming rehearsals
app.get('/api/rehearsals/upcoming', async (req, res) => {
  try {
    const db = await getDatabase();
    const rehearsals = await db.all(`
      SELECT 
        r.*,
        m.name as created_by_name
      FROM rehearsals r
      LEFT JOIN members m ON r.created_by = m.id
      WHERE r.date >= date('now')
      ORDER BY r.date ASC
      LIMIT 5
    `);

    const rehearsalsWithRelations = rehearsals.map(rehearsal => ({
      ...rehearsal,
      rehearsal_songs: [],
      rehearsal_attendance: []
    }));

    res.json(rehearsalsWithRelations);
  } catch (error) {
    console.error('Error fetching upcoming rehearsals:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming rehearsals' });
  }
});

// Services API (simplified)
app.get('/api/services', async (req, res) => {
  try {
    res.json([]); // Empty for now
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/services/upcoming', async (req, res) => {
  try {
    res.json([]); // Empty for now
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming services' });
  }
});

// Rules API
app.get('/api/rules', async (req, res) => {
  try {
    const db = await getDatabase();
    const rules = await db.all(`
      SELECT 
        mr.*,
        m.name as created_by_name
      FROM ministry_rules mr
      LEFT JOIN members m ON mr.created_by = m.id
      WHERE mr.is_active = 1
      ORDER BY mr.category, mr.order_position
    `);

    // Group by category
    const grouped = rules.reduce((acc, rule) => {
      const category = rule.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rule);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// Delete rule
app.delete('/api/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const result = await db.run(`
      UPDATE ministry_rules 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// Update rehearsal attendance
app.patch('/api/rehearsals/:id/attendance', async (req, res) => {
  try {
    const { id: rehearsalId } = req.params;
    const { memberId, status } = req.body;
    const db = await getDatabase();

    // First, check if attendance record exists
    const existing = await db.get(`
      SELECT id FROM rehearsal_attendance 
      WHERE rehearsal_id = ? AND member_id = ?
    `, [rehearsalId, memberId]);

    let result;
    if (existing) {
      // Update existing record
      result = await db.run(`
        UPDATE rehearsal_attendance 
        SET status = ?
        WHERE rehearsal_id = ? AND member_id = ?
      `, [status, rehearsalId, memberId]);

      const updated = await db.get(`
        SELECT * FROM rehearsal_attendance 
        WHERE rehearsal_id = ? AND member_id = ?
      `, [rehearsalId, memberId]);

      res.json(updated);
    } else {
      // Create new record
      result = await db.run(`
        INSERT INTO rehearsal_attendance (rehearsal_id, member_id, status)
        VALUES (?, ?, ?)
      `, [rehearsalId, memberId, status]);

      const newRecord = await db.get(`
        SELECT * FROM rehearsal_attendance WHERE id = ?
      `, [result.lastID]);

      res.json(newRecord);
    }
  } catch (error) {
    console.error('Error updating rehearsal attendance:', error);
    res.status(500).json({ error: 'Failed to update rehearsal attendance' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Praise Planner Pro Server (SQLite) started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('🎵 Ready to serve the ministry!');
});

export default app;