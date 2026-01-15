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
      WHERE s.ministry_id = $1
    `;
    const params = [req.user.ministryId];
    let paramCount = 1;

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
      WHERE s.id = $1 AND s.ministry_id = $2
    `, [id, req.user.ministryId]);

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
      name, type, key, is_favorite, lyrics, chords,
      notes, youtube_url, created_by
    } = req.body;

    // Get the member ID for the authenticated user
    const memberResult = await pool.query(
      'SELECT id FROM members WHERE user_id = $1 AND ministry_id = $2',
      [req.user.id, req.user.ministryId]
    );

    const createdByMemberId = memberResult.rows.length > 0 ? memberResult.rows[0].id : null;

    const result = await pool.query(`
      INSERT INTO songs (
        ministry_id, name, type, key, is_favorite, lyrics, chords, 
        notes, youtube_url, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.user.ministryId, name, type, key, is_favorite, lyrics, chords, notes, youtube_url, createdByMemberId]);

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
      name, type, key, is_favorite, lyrics, chords,
      notes, youtube_url
    } = req.body;

    const result = await pool.query(`
      UPDATE songs 
      SET name = $1, type = $2, key = $3, is_favorite = $4,
          lyrics = $5, chords = $6, notes = $7, youtube_url = $8, 
          updated_at = NOW()
      WHERE id = $9 AND ministry_id = $10
      RETURNING *
    `, [name, type, key, is_favorite, lyrics, chords, notes, youtube_url, id, req.user.ministryId]);

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
      WHERE id = $2 AND ministry_id = $3
      RETURNING *
    `, [is_favorite, id, req.user.ministryId]);

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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Explicitly delete from related tables first (safety net against missing CASCADEs)
    await client.query('DELETE FROM service_songs WHERE song_id = $1', [id]);
    await client.query('DELETE FROM rehearsal_songs WHERE song_id = $1', [id]);

    const result = await client.query('DELETE FROM songs WHERE id = $1 AND ministry_id = $2 RETURNING *', [id, req.user.ministryId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Song not found' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  } finally {
    client.release();
  }
});

export default router;