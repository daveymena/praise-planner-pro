import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Helper to generate invite code
const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// POST /api/auth/register - Register admin and create ministry
router.post('/register', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password, ministryName, name } = req.body;

        if (!email || !password || !ministryName) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        await client.query('BEGIN');

        // 1. Create Ministry
        const inviteCode = generateInviteCode();
        const ministryResult = await client.query(
            'INSERT INTO ministries (name, invite_code) VALUES ($1, $2) RETURNING id',
            [ministryName, inviteCode]
        );
        const ministryId = ministryResult.rows[0].id;

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create User
        const userResult = await client.query(
            'INSERT INTO users (email, password_hash, role, ministry_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, passwordHash, 'admin', ministryId]
        );
        const userId = userResult.rows[0].id;

        // 4. Create Member (link to user)
        await client.query(
            'INSERT INTO members (ministry_id, user_id, name, email, role) VALUES ($1, $2, $3, $4, $5)',
            [ministryId, userId, name || ministryName, email, 'Director']
        );

        await client.query('COMMIT');

        // 5. Generate Token
        const token = jwt.sign(
            { id: userId, ministryId, role: 'admin' },
            process.env.JWT_SECRET || 'secret-worship-key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: { id: userId, email, role: 'admin' },
            ministry: { id: ministryId, name: ministryName, inviteCode }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error al registrar el ministerio' });
    } finally {
        client.release();
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT u.*, m.name as ministry_name, m.invite_code FROM users u JOIN ministries m ON u.ministry_id = m.id WHERE u.email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, ministryId: user.ministry_id, role: user.role },
            process.env.JWT_SECRET || 'secret-worship-key',
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role },
            ministry: { id: user.ministry_id, name: user.ministry_name, inviteCode: user.invite_code }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-worship-key');

        const result = await pool.query(
            'SELECT u.id, u.email, u.role, u.ministry_id, m.name as ministry_name FROM users u JOIN ministries m ON u.ministry_id = m.id WHERE u.id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

export default router;
