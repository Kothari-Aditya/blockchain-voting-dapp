import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Send OTP via WhatsApp using pywhatkit
 * @param {string} phoneNumber - Recipient's phone number with country code
 * @param {string} otp - The OTP to send
 * @returns {Promise} Result of sending WhatsApp message
 */
export const sendOtpViaWhatsapp = async (phoneNumber, otp) => {
    // Ensure phone number has country code (default to +91 if none)
    const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber.substring(1) 
        : (phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber);
    
    console.log(`[WhatsApp] Sending OTP ${otp} to ${formattedPhone}`);
    
    return new Promise((resolve, reject) => {
        // Use the pywhatkit script
        const pythonScript = path.join(__dirname, 'whatsappOtpSenderScript.py');
        
        const pythonProcess = spawn('python', [
            pythonScript,
            '--phone', formattedPhone,
            '--otp', otp
        ]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Python output: ${data}`);
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`Python error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0 && output.includes('successfully')) {
                console.log(`WhatsApp OTP sent successfully to ${formattedPhone}`);
                resolve({ success: true, messageId: 'whatsapp-message-id' });
            } else {
                console.error(`Error sending WhatsApp OTP: ${errorOutput || output}`);
                reject(new Error(errorOutput || output || 'Failed to send OTP via WhatsApp'));
            }
        });
    });
};