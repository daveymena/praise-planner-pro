import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'order_position', ss.order_position,
              'song', jsonb_build_object(
                'id', song.id,
                'name', song.name,
                'key', song.key,
                'type', song.type
              ),
              'leader', jsonb_build_object(
                'name', leader.name
              )
            )
          ) FILTER (WHERE ss.id IS NOT NULL), 
          '[]'
        ) as service_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role', sa.role,
              'member', jsonb_build_object(
                'name', member.name
              )
            )
          ) FILTER (WHERE sa.id IS NOT NULL),
          '[]'
        ) as service_assignments
      FROM services s
      LEFT JOIN members m ON s.created_by = m.id
      LEFT JOIN service_songs ss ON s.id = ss.service_id
      LEFT JOIN songs song ON ss.song_id = song.id
      LEFT JOIN members leader ON ss.leader_id = leader.id
      LEFT JOIN service_assignments sa ON s.id = sa.service_id
      LEFT JOIN members member ON sa.member_id = member.id
      GROUP BY s.id, m.name
      ORDER BY s.date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/upcoming - Get upcoming services
router.get('/upcoming', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'order_position', ss.order_position,
              'song', jsonb_build_object(
                'id', song.id,
                'name', song.name,
                'key', song.key,
                'type', song.type
              ),
              'leader', jsonb_build_object(
                'name', leader.name
              )
            )
          ) FILTER (WHERE ss.id IS NOT NULL), 
          '[]'
        ) as service_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role', sa.role,
              'member', jsonb_build_object(
                'name', member.name
              )
            )
          ) FILTER (WHERE sa.id IS NOT NULL),
          '[]'
        ) as service_assignments
      FROM services s
      LEFT JOIN members m ON s.created_by = m.id
      LEFT JOIN service_songs ss ON s.id = ss.service_id
      LEFT JOIN songs song ON ss.song_id = song.id
      LEFT JOIN members leader ON ss.leader_id = leader.id
      LEFT JOIN service_assignments sa ON s.id = sa.service_id
      LEFT JOIN members member ON sa.member_id = member.id
      WHERE s.date >= CURRENT_DATE
      GROUP BY s.id, m.name
      ORDER BY s.date ASC
      LIMIT 5
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming services:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming services' });
  }
});

// POST /api/services - Create new service
router.post('/', async (req, res) => {
  try {
    const { name, date, time, type, location, theme, notes, created_by } = req.body;
    
    const result = await pool.query(`
      INSERT INTO services (name, date, time, type, location, theme, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, date, time, type, location, theme, notes, created_by]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

export default router;