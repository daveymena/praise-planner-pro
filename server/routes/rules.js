import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/rules - Get all ministry rules grouped by category
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        mr.*,
        m.name as created_by_name
      FROM ministry_rules mr
      LEFT JOIN members m ON mr.created_by = m.id
      WHERE mr.is_active = true
      ORDER BY mr.category, mr.order_position
    `);
    
    // Group by category
    const grouped = result.rows.reduce((acc, rule) => {
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

// POST /api/rules - Create new rule
router.post('/', async (req, res) => {
  try {
    const { title, content, category, order_position, created_by } = req.body;
    
    const result = await pool.query(`
      INSERT INTO ministry_rules (title, content, category, order_position, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, content, category, order_position, created_by]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

// DELETE /api/rules/:id - Soft delete rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE ministry_rules 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND is_active = true
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

export default router;