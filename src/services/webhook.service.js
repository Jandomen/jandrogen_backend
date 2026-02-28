const axios = require('axios');

const triggerN8nWebhook = async (data) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('⚠️ N8N_WEBHOOK_URL is not defined in .env');
        return;
    }

    try {
        console.log('🚀 Enviando evento a n8n...');
        await axios.post(webhookUrl, data);
        console.log('✅ Evento enviado correctamente a n8n');
    } catch (error) {
        console.error('❌ Error enviando evento a n8n:', error.message);
    }
};

module.exports = {
    triggerN8nWebhook
};
