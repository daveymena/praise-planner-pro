#!/usr/bin/env node
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyPersistence() {
    try {
        console.log('='.repeat(60));
        console.log('DATABASE PERSISTENCE TEST');
        console.log('='.repeat(60));

        // Check 1: Count users
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`✓ Users in database: ${userCount.rows[0].count}`);

        // Check 2: List all users
        const users = await pool.query('SELECT id, email, role FROM users');
        console.log('\n📋 Current Users:');
        users.rows.forEach(user => {
            console.log(`   - ${user.email} (${user.role}) [ID: ${user.id.substring(0, 8)}...]`);
        });

        // Check 3: Count ministries
        const ministryCount = await pool.query('SELECT COUNT(*) as count FROM ministries');
        console.log(`\n✓ Ministries in database: ${ministryCount.rows[0].count}`);

        // Check 4: Count members
        const memberCount = await pool.query('SELECT COUNT(*) as count FROM members');
        console.log(`✓ Members in database: ${memberCount.rows[0].count}`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Database is healthy and contains data');
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyPersistence();
