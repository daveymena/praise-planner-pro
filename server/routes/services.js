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
      WHERE s.ministry_id = $1
      GROUP BY s.id, m.name
      ORDER BY s.date DESC
    `, [req.user.ministryId]);

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
      WHERE s.date >= CURRENT_DATE AND s.ministry_id = $1
      GROUP BY s.id, m.name
      ORDER BY s.date ASC
      LIMIT 5
    `, [req.user.ministryId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming services:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming services' });
  }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        s.*,
        m.name as created_by_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', song.id,
              'name', song.name,
              'key', song.key,
              'type', song.type,
              'order_position', ss.order_position
            )
          ) FILTER (WHERE ss.id IS NOT NULL), 
          '[]'
        ) as service_songs,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'member_id', sa.member_id,
              'member_name', member.name,
              'role', sa.role
            )
          ) FILTER (WHERE sa.id IS NOT NULL),
          '[]'
        ) as service_assignments
      FROM services s
      LEFT JOIN members m ON s.created_by = m.id
      LEFT JOIN service_songs ss ON s.id = ss.service_id
      LEFT JOIN songs song ON ss.song_id = song.id
      LEFT JOIN service_assignments sa ON s.id = sa.service_id
      LEFT JOIN members member ON sa.member_id = member.id
      WHERE s.id = $1 AND s.ministry_id = $2
      GROUP BY s.id, m.name
    `, [id, req.user.ministryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /api/services - Create new service with assignments
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, date, time, type, location, theme, notes, created_by, songs, team } = req.body;

    // 1. Insert service
    const serviceResult = await client.query(`
      INSERT INTO services (ministry_id, name, date, time, type, location, theme, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULLIF($9, '')::uuid)
      RETURNING *
    `, [req.user.ministryId, name, date, time, type, location, theme, notes, created_by]);

    const service = serviceResult.rows[0];

    // 2. Insert songs
    if (songs && songs.length > 0) {
      for (let i = 0; i < songs.length; i++) {
        await client.query(`
          INSERT INTO service_songs (service_id, song_id, order_position)
          VALUES ($1, $2, $3)
        `, [service.id, songs[i], i + 1]);
      }
    }

    // 3. Insert team assignments
    if (team && team.length > 0) {
      for (const member of team) {
        await client.query(`
          INSERT INTO service_assignments (service_id, member_id, role)
          VALUES ($1, $2, $3)
        `, [service.id, member.member_id, member.role]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(service);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  } finally {
    client.release();
  }
});

// PUT /api/services/:id - Update service and assignments
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, date, time, type, location, theme, notes, songs, team } = req.body;

    // 1. Update service
    const result = await client.query(`
      UPDATE services 
      SET name = $1, date = $2, time = $3, type = $4, 
          location = $5, theme = $6, notes = $7, updated_at = NOW()
      WHERE id = $8 AND ministry_id = $9
      RETURNING *
    `, [name, date, time, type, location, theme, notes, id, req.user.ministryId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Service not found' });
    }

    // 2. Clear and update songs
    await client.query('DELETE FROM service_songs WHERE service_id = $1', [id]);
    if (songs && songs.length > 0) {
      for (let i = 0; i < songs.length; i++) {
        await client.query(`
          INSERT INTO service_songs (service_id, song_id, order_position)
          VALUES ($1, $2, $3)
        `, [id, songs[i], i + 1]);
      }
    }

    // 3. Clear and update team
    await client.query('DELETE FROM service_assignments WHERE service_id = $1', [id]);
    if (team && team.length > 0) {
      for (const member of team) {
        await client.query(`
          INSERT INTO service_assignments (service_id, member_id, role)
          VALUES ($1, $2, $3)
        `, [id, member.member_id, member.role]);
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  } finally {
    client.release();
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // service_songs and service_assignments should have ON DELETE CASCADE
    const result = await pool.query('DELETE FROM services WHERE id = $1 AND ministry_id = $2 RETURNING *', [id, req.user.ministryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;