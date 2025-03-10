// For production, replace with actual Twilio integration
// import twilio from 'twilio';
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
 * Send OTP via SMS
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} otp - The OTP to send
 * @returns {Promise} Result of sending SMS
 */
export const sendOtpViaSms = async (phoneNumber, otp) => {
    // For development/testing - log to console
    console.log(`[MOCK SMS] Sending OTP ${otp} to ${phoneNumber}`);
    
    // For production with Twilio, uncomment:
    /*
    try {
        const message = await client.messages.create({
            body: `Your voting app verification code is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
    */
    
    // Mock return for development
    return { success: true, messageId: 'mock-message-id' };
};