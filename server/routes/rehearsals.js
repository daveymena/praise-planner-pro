import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/rehearsals - Get all rehearsals with related data
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'order_position', rs.order_position,
              'song', jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'key', s.key
              ),
              'leader', jsonb_build_object(
                'name', leader.name
              )
            )
          ) FILTER (WHERE rs.id IS NOT NULL), 
          '[]'
        ) as rehearsal_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'status', ra.status,
              'member', jsonb_build_object(
                'name', member.name
              )
            )
          ) FILTER (WHERE ra.id IS NOT NULL),
          '[]'
        ) as rehearsal_attendance
      FROM rehearsals r
      LEFT JOIN members m ON r.created_by = m.id
      LEFT JOIN rehearsal_songs rs ON r.id = rs.rehearsal_id
      LEFT JOIN songs s ON rs.song_id = s.id
      LEFT JOIN members leader ON rs.leader_id = leader.id
      LEFT JOIN rehearsal_attendance ra ON r.id = ra.rehearsal_id
      LEFT JOIN members member ON ra.member_id = member.id
      GROUP BY r.id, m.name
      ORDER BY r.date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rehearsals:', error);
    res.status(500).json({ error: 'Failed to fetch rehearsals' });
  }
});

// GET /api/rehearsals/upcoming - Get upcoming rehearsals
router.get('/upcoming', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'order_position', rs.order_position,
              'song', jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'key', s.key
              ),
              'leader', jsonb_build_object(
                'name', leader.name
              )
            )
          ) FILTER (WHERE rs.id IS NOT NULL), 
          '[]'
        ) as rehearsal_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'status', ra.status,
              'member', jsonb_build_object(
                'name', member.name
              )
            )
          ) FILTER (WHERE ra.id IS NOT NULL),
          '[]'
        ) as rehearsal_attendance
      FROM rehearsals r
      LEFT JOIN members m ON r.created_by = m.id
      LEFT JOIN rehearsal_songs rs ON r.id = rs.rehearsal_id
      LEFT JOIN songs s ON rs.song_id = s.id
      LEFT JOIN members leader ON rs.leader_id = leader.id
      LEFT JOIN rehearsal_attendance ra ON r.id = ra.rehearsal_id
      LEFT JOIN members member ON ra.member_id = member.id
      WHERE r.date >= CURRENT_DATE
      GROUP BY r.id, m.name
      ORDER BY r.date ASC
      LIMIT 5
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming rehearsals:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming rehearsals' });
  }
});

// GET /api/rehearsals/:id - Get rehearsal by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        r.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', rs.id,
              'order_position', rs.order_position,
              'notes', rs.notes,
              'song', jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'key', s.key,
                'type', s.type
              ),
              'leader', jsonb_build_object(
                'id', leader.id,
                'name', leader.name
              )
            )
          ) FILTER (WHERE rs.id IS NOT NULL), 
          '[]'
        ) as rehearsal_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ra.id,
              'status', ra.status,
              'notes', ra.notes,
              'member', jsonb_build_object(
                'id', member.id,
                'name', member.name,
                'role', member.role
              )
            )
          ) FILTER (WHERE ra.id IS NOT NULL),
          '[]'
        ) as rehearsal_attendance
      FROM rehearsals r
      LEFT JOIN members m ON r.created_by = m.id
      LEFT JOIN rehearsal_songs rs ON r.id = rs.rehearsal_id
      LEFT JOIN songs s ON rs.song_id = s.id
      LEFT JOIN members leader ON rs.leader_id = leader.id
      LEFT JOIN rehearsal_attendance ra ON r.id = ra.rehearsal_id
      LEFT JOIN members member ON ra.member_id = member.id
      WHERE r.id = $1
      GROUP BY r.id, m.name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rehearsal not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching rehearsal:', error);
    res.status(500).json({ error: 'Failed to fetch rehearsal' });
  }
});

// POST /api/rehearsals - Create new rehearsal
router.post('/', async (req, res) => {
  try {
    const { date, time, location, type, notes, created_by } = req.body;
    
    const result = await pool.query(`
      INSERT INTO rehearsals (date, time, location, type, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [date, time, location, type, notes, created_by]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating rehearsal:', error);
    res.status(500).json({ error: 'Failed to create rehearsal' });
  }
});

// PUT /api/rehearsals/:id - Update rehearsal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, location, type, notes } = req.body;
    
    const result = await pool.query(`
      UPDATE rehearsals 
      SET date = $1, time = $2, location = $3, type = $4, notes = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [date, time, location, type, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rehearsal not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rehearsal:', error);
    res.status(500).json({ error: 'Failed to update rehearsal' });
  }
});

// DELETE /api/rehearsals/:id - Delete rehearsal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM rehearsals WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rehearsal not found' });
    }
    
    res.json({ message: 'Rehearsal deleted successfully' });
  } catch (error) {
    console.error('Error deleting rehearsal:', error);
    res.status(500).json({ error: 'Failed to delete rehearsal' });
  }
});

// PATCH /api/rehearsals/:id/attendance - Update rehearsal attendance
router.patch('/:id/attendance', async (req, res) => {
  try {
    const { id: rehearsalId } = req.params;
    const { memberId, status } = req.body;
    
    // First, check if attendance record exists
    const existingResult = await pool.query(`
      SELECT id FROM rehearsal_attendance 
      WHERE rehearsal_id = $1 AND member_id = $2
    `, [rehearsalId, memberId]);
    
    let result;
    if (existingResult.rows.length > 0) {
      // Update existing record
      result = await pool.query(`
        UPDATE rehearsal_attendance 
        SET status = $1, updated_at = NOW()
        WHERE rehearsal_id = $2 AND member_id = $3
        RETURNING *
      `, [status, rehearsalId, memberId]);
    } else {
      // Create new record
      result = await pool.query(`
        INSERT INTO rehearsal_attendance (rehearsal_id, member_id, status)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [rehearsalId, memberId, status]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rehearsal attendance:', error);
    res.status(500).json({ error: 'Failed to update rehearsal attendance' });
  }
});

export default router;