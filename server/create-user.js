import bcrypt from 'bcryptjs';
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createUser() {
    try {
        const name = 'Davey Mena';
        const email = 'daveymena16@gmail.com';
        const password = '6715320Dvd';
        const ministryName = 'Ministerio de Alabanza';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate random invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create ministry first
        const ministryResult = await pool.query(
            `INSERT INTO ministries (name, invite_code, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING id`,
            [ministryName, inviteCode]
        );

        const ministryId = ministryResult.rows[0].id;

        // Create user
        const userResult = await pool.query(
            `INSERT INTO users (email, password_hash, role, ministry_id, created_at, updated_at)
       VALUES ($1, $2, 'admin', $3, NOW(), NOW())
       RETURNING id, email, role`,
            [email, hashedPassword, ministryId]
        );

        const userId = userResult.rows[0].id;

        // Create member profile
        const memberResult = await pool.query(
            `INSERT INTO members (ministry_id, user_id, name, email, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'Director', true, NOW(), NOW())
       RETURNING id`,
            [ministryId, userId, name, email]
        );

        console.log('✅ Usuario creado exitosamente:');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Nombre:', name);
        console.log('🏢 Ministerio:', ministryName);
        console.log('🎫 Código de invitación:', inviteCode);
        console.log('🆔 Usuario ID:', userId);
        console.log('👥 Member ID:', memberResult.rows[0].id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        process.exit(1);
    }
}

createUser();
