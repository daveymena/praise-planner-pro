import axios from 'axios';
import pool from '../config/database.js';

/**
 * WhatsApp Service for automatic notifications.
 * This service is designed to work with various HTTP-based WhatsApp APIs 
 * such as UltraMsg, Evolution API, Green-API, etc.
 */
class WhatsAppService {
    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL;
        this.apiKey = process.env.WHATSAPP_API_KEY;
        this.senderInstance = process.env.WHATSAPP_INSTANCE_ID; // Optional, depended on API
    }

    /**
     * Send a message to a list of member IDs
     * @param {string[]} memberIds List of member UUIDs
     * @param {string} message The text to send
     */
    async notifyMembers(memberIds, message) {
        if (!memberIds || memberIds.length === 0) return;
        if (!this.apiUrl || !this.apiKey) {
            console.warn('⚠️ WhatsApp API not configured. Notification skipped.');
            return;
        }

        try {
            // 1. Get member details (names and phones)
            const result = await pool.query(
                'SELECT name, phone FROM members WHERE id = ANY($1) AND phone IS NOT NULL AND phone != \'\'',
                [memberIds]
            );

            const members = result.rows;
            if (members.length === 0) {
                console.log('ℹ️ No valid phone numbers found for assigned members.');
                return;
            }

            console.log(`🚀 Sending WhatsApp notifications to ${members.length} members...`);

            // 2. Send messages (Parallel)
            const sendPromises = members.map(member => {
                // Sanitize phone number (ensure it has country code, etc.)
                const cleanPhone = member.phone.replace(/\D/g, '');

                // Example integration for UltraMsg style API
                // For other APIs, you may need to adjust the structure here
                return axios.post(`${this.apiUrl}/messages/chat`, {
                    token: this.apiKey,
                    to: cleanPhone,
                    body: `Hola *${member.name}*! 👋\n\n${message}`
                }).catch(err => {
                    console.error(`❌ Error sending to ${member.name} (${cleanPhone}):`, err.message);
                });
            });

            await Promise.all(sendPromises);
            console.log('✅ All notifications processed.');

        } catch (error) {
            console.error('❌ WhatsApp Notification Service failed:', error.message);
        }
    }

    /**
     * Formal notification for a new Rehearsal
     */
    async notifyNewRehearsal(rehearsal, memberIds) {
        const date = new Date(rehearsal.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const msg = `Se ha programado un nuevo *ENSAYO* 🎵\n\n` +
            `📅 *Fecha:* ${date}\n` +
            `⏰ *Hora:* ${rehearsal.time}\n` +
            `📍 *Lugar:* ${rehearsal.location}\n` +
            `📝 *Notas:* ${rehearsal.notes || 'N/A'}\n\n` +
            `Por favor confirma tu asistencia en la aplicación. 🙌`;

        await this.notifyMembers(memberIds, msg);
    }

    /**
     * Formal notification for a new Service
     */
    async notifyNewService(service, memberAssignments) {
        const memberIds = memberAssignments.map(a => a.member_id);
        const date = new Date(service.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

        const msg = `Se ha programado tu participación en un *SERVICIO* ⛪\n\n` +
            `✨ *Nombre:* ${service.name}\n` +
            `📅 *Fecha:* ${date}\n` +
            `⏰ *Hora:* ${service.time}\n` +
            `📍 *Lugar:* ${service.location}\n` +
            `🕊️ *Tema:* ${service.theme || 'N/A'}\n\n` +
            `¡Prepárate con excelencia para adorar al Señor! 🔥`;

        await this.notifyMembers(memberIds, msg);
    }
}

export default new WhatsAppService();
