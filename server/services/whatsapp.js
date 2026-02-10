// server/services/whatsapp.js

/**
 * WhatsApp Service Handler
 * This service handles communication with WhatsApp Business API (via Meta, Interakt, etc.)
 */

const axios = require('axios');

/**
 * Send a WhatsApp Message
 * @param {string} to - Recipient phone number with country code
 * @param {string} message - Message content (for free-tier/session messages)
 * @param {string} templateName - Name of the approved template (for business-initiated)
 * @param {Array} components - Values for template variables
 */
async function sendWhatsAppMessage({ to, message, templateName, components }) {
    // Ensure phone number has country code 
    const formattedPhone = to.startsWith('91') ? to : `91${to.replace(/\D/g, '').slice(-10)}`;

    console.log(`\n--- [WHATSAPP OUTGOING] ---`);
    console.log(`To: ${formattedPhone}`);
    if (templateName) {
        console.log(`Template: ${templateName}`);
        console.log(`Variables: ${JSON.stringify(components)}`);
    } else {
        console.log(`Message: ${message}`);
    }
    console.log(`---------------------------\n`);

    // PLAN: Connect to a Provider
    // For production, we will uncomment the following block and use environment variables

    /*
    const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
    try {
        const response = await axios.post('https://api.interakt.ai/v1/public/message/', {
            phoneNumber: formattedPhone,
            countryCode: '+91',
            type: 'Template',
            template: {
                name: templateName,
                languageCode: 'en',
                bodyValues: components
            }
        }, {
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        throw error;
    }
    */

    return { success: true, message: "Simulated success (Check server console for logs)" };
}

/**
 * Notify Admin of New Order
 * @param {string} orderId 
 * @param {Object} orderData 
 */
async function notifyAdminNewOrder(orderId, orderData) {
    // Notify multiple admins if needed
    const adminNumbers = ['916380016798'];

    for (const num of adminNumbers) {
        await sendWhatsAppMessage({
            to: num,
            message: `[NEW ORDER] ID: ${orderId}\nCustomer: ${orderData.user.name}\nTotal: ₹${orderData.total}\nMethod: ${orderData.paymentMethod}`,
            // In production, use a template for business notifications
            // templateName: 'admin_order_alert',
            // components: [orderId, orderData.user.name, orderData.total.toString()]
        });
    }
}

module.exports = {
    sendWhatsAppMessage,
    notifyAdminNewOrder
};
