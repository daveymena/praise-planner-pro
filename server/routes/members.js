import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/members - Get all active members
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM members 
      WHERE ministry_id = $1 AND is_active = true 
      ORDER BY name ASC
    `, [req.user.ministryId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM members WHERE id = $1 AND ministry_id = $2', [id, req.user.ministryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, instruments, voice_type, notes } = req.body;

    const result = await pool.query(`
      INSERT INTO members (ministry_id, name, email, phone, role, instruments, voice_type, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.user.ministryId, name, email, phone, role, instruments, voice_type, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create member' });
    }
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, instruments, voice_type, notes } = req.body;

    const result = await pool.query(`
      UPDATE members 
      SET name = $1, email = $2, phone = $3, role = $4, 
          instruments = $5, voice_type = $6, notes = $7, updated_at = NOW()
      WHERE id = $8 AND ministry_id = $9 AND is_active = true
      RETURNING *
    `, [name, email, phone, role, instruments, voice_type, notes, id, req.user.ministryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Soft delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE members 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND ministry_id = $2 AND is_active = true
      RETURNING *
    `, [id, req.user.ministryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;