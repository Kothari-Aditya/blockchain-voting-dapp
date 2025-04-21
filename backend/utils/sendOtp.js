// Import WhatsApp sender
import { sendOtpViaWhatsapp } from './sendWhatsappOtp.js';

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mask phone number for display (e.g. +91 98765-XXXXX)
 * @param {string} phoneNumber - The full phone number
 * @returns {string} Masked phone number
 */
export const maskPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Keep last 5 digits visible, mask the rest
    const lastFive = phoneNumber.slice(-5);
    const maskedPart = phoneNumber.slice(0, -5).replace(/\d/g, 'X');
    
    return maskedPart + lastFive;
};

/**
 * Send OTP via SMS or WhatsApp
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} otp - The OTP to send
 * @returns {Promise} Result of sending OTP
 */
export const sendOtpViaSms = async (phoneNumber, otp) => {
    try {
        // Try to send OTP via WhatsApp first
        console.log(`[OTP Service] Sending OTP ${otp} to ${phoneNumber} via WhatsApp`);
        const result = await sendOtpViaWhatsapp(phoneNumber, otp);
        return { success: true, messageId: result.messageId, channel: 'whatsapp' };
    } catch (whatsappError) {
        // If WhatsApp fails, log error and fall back to console log
        console.error('[OTP Service] WhatsApp delivery failed:', whatsappError.message);
        
        // For development/testing - log to console as fallback
        console.log(`[MOCK SMS] Sending OTP ${otp} to ${phoneNumber} (WhatsApp failed)`);
        
        // For production with Twilio, uncomment:
        /*
        try {
            const message = await client.messages.create({
                body: `Your voting app verification code is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            return { success: true, messageId: message.sid, channel: 'sms' };
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
        */
        
        // Mock return for development
        return { success: true, messageId: 'mock-message-id', channel: 'mock' };
    }
};