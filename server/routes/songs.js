import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/songs - Get all songs with filters
router.get('/', async (req, res) => {
  try {
    const { type, favorite, search } = req.query;

    let query = `
      SELECT s.*, m.name as created_by_name 
      FROM songs s
      LEFT JOIN members m ON s.created_by = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND s.type = $${paramCount}`;
      params.push(type);
    }

    if (favorite === 'true') {
      query += ` AND s.is_favorite = true`;
    }

    if (search) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY s.name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET /api/songs/:id - Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, m.name as created_by_name 
      FROM songs s
      LEFT JOIN members m ON s.created_by = m.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// POST /api/songs - Create new song
router.post('/', async (req, res) => {
  try {
    const {
      name, type, key, tempo, is_favorite, lyrics, chords,
      notes, youtube_url, duration_minutes, created_by
    } = req.body;

    const result = await pool.query(`
      INSERT INTO songs (
        name, type, key, tempo, is_favorite, lyrics, chords, 
        notes, youtube_url, duration_minutes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULLIF($11, '')::uuid)
      RETURNING *
    `, [name, type, key, tempo, is_favorite, lyrics, chords, notes, youtube_url, duration_minutes, created_by]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// PUT /api/songs/:id - Update song
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, type, key, tempo, is_favorite, lyrics, chords,
      notes, youtube_url, duration_minutes
    } = req.body;

    const result = await pool.query(`
      UPDATE songs 
      SET name = $1, type = $2, key = $3, tempo = $4, is_favorite = $5,
          lyrics = $6, chords = $7, notes = $8, youtube_url = $9, 
          duration_minutes = $10, updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [name, type, key, tempo, is_favorite, lyrics, chords, notes, youtube_url, duration_minutes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// PATCH /api/songs/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;

    const result = await pool.query(`
      UPDATE songs 
      SET is_favorite = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [is_favorite, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating song favorite:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id - Delete song
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM songs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

export default router;