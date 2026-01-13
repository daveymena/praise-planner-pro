import bcrypt from 'bcryptjs';
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetAdmin() {
    try {
        console.log('--- RESET ADMIN STARTED ---');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_NAME:', process.env.DB_NAME);

        const email = 'daveymena16@gmail.com';
        const password = '6715320Dvd';
        const name = 'Davey Mena';
        const ministryName = 'Ministerio de Alabanza';

        // 1. Check/Delete Existing
        console.log(`Checking for user: ${email}...`);
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            console.log('User found. Deleting to ensure clean state...');
            await pool.query('DELETE FROM members WHERE userId IN (SELECT id FROM users WHERE email = $1)', [email]);
            await pool.query('DELETE FROM users WHERE email = $1', [email]);
            console.log('Old user deleted.');
        }

        // 2. Create Fresh
        console.log('Creating fresh user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Ministry
        const ministryResult = await pool.query(
            `INSERT INTO ministries (name, invite_code, created_at, updated_at) 
             VALUES ($1, $2, NOW(), NOW()) 
             RETURNING id`,
            [ministryName, inviteCode]
        );
        const ministryId = ministryResult.rows[0].id;
        console.log('Ministry created ID:', ministryId);

        // User
        const userResult = await pool.query(
            `INSERT INTO users (email, password_hash, role, ministry_id, created_at, updated_at)
             VALUES ($1, $2, 'admin', $3, NOW(), NOW())
             RETURNING id`,
            [email, hashedPassword, ministryId]
        );
        const userId = userResult.rows[0].id;
        console.log('User created ID:', userId);

        // Member
        await pool.query(
            `INSERT INTO members (ministry_id, user_id, name, email, role, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'Director', true, NOW(), NOW())`,
            [ministryId, userId, name, email]
        );
        console.log('Member profile created.');

        // 3. Verify
        const verify = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (verify.rows.length > 0) {
            console.log('✅ VERIFICATION SUCCESS: User exists in DB now.');
        } else {
            console.error('❌ VERIFICATION FAILED: User disappeared?');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error in reset script:', error);
        process.exit(1);
    }
}

resetAdmin();
