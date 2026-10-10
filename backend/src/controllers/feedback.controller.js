
// Reuse canonical mailer transport — single source of truth
const log = require('../utils/logger');
const { getTransporter, escapeHtml } = require('../config/mailer');

async function post(req,res,next){
  try{
        try {
    
            const { name, email, message } = req.body || {};
    
            // VALIDATION (trim-first so whitespace-only is rejected)
            const tName = typeof name === 'string' ? name.trim() : '';
            const tEmail = typeof email === 'string' ? email.trim() : '';
            const tMessage = typeof message === 'string' ? message.trim() : '';
            if (!tName || !tEmail || !tMessage) {
                return res.status(400).json({
                    error: 'All fields are required.'
                });
            }
            if (tName.length > 100 || tEmail.length > 254 || tMessage.length > 5000) {
                return res.status(400).json({ error: 'Feedback fields too long.' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tEmail)) {
                return res.status(400).json({ error: 'Invalid email address.' });
            }

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
                return res.status(503).json({ error: 'Feedback service is not configured. Try again later.' });
            }
    
            // TRANSPORTER (singleton)
            const transporter = getTransporter();
    
            // EMAIL
            await transporter.sendMail({
    
                from: process.env.EMAIL_USER,

                replyTo: tEmail,
    
                to: process.env.RECEIVER_EMAIL,
    
                subject: 'New Feedback Message',
    
                html: `
                    <div style="font-family: Arial; padding: 20px;">
    
                        <h2>New Feedback</h2>
    
                        <p>
                            <strong>Name:</strong> ${escapeHtml(tName)}
                        </p>
    
                        <p>
                            <strong>Email:</strong> ${escapeHtml(tEmail)}
                        </p>
    
                        <p>
                            <strong>Message:</strong>
                        </p>
    
                        <div style="
                            background: #f4f4f4;
                            padding: 15px;
                            border-radius: 8px;
                        ">
                            ${escapeHtml(tMessage)}
                        </div>
    
                    </div>
                `
            });
    
            res.json({
                success: true,
                message: 'Feedback sent successfully.'
            });
    
        } catch (err) {

            log.error('Feedback Error:', err.code || err.message);

            // SMTP/auth failures (e.g. bad Gmail app password) are config issues,
            // not client errors — report 503 so the UI can show "try again later".
            if (err.code === 'EAUTH' || err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
                return res.status(503).json({ error: 'Feedback service is temporarily unavailable. Please try again later.' });
            }

            next(err);

        }
  }catch(e){ next(e); }
}

module.exports = { post };
