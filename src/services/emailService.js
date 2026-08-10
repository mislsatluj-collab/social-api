const https = require("https");
const env = require("../config/env");

const sendEmail = async ({ to, subject, text, html }) => {
    // If SMTP_MAIL is not set, log it to console instead
    if (!env.SMTP_MAIL || env.SMTP_MAIL === "console") {
        console.log("---------------------------------------------------------");
        console.log(`[EMAIL SIMULATION] To: ${to}`);
        console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
        console.log(`[EMAIL SIMULATION] Body: ${text}`);
        console.log("---------------------------------------------------------");
        return true;
    }

    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            sender: {
                name: "Misl Satluj Platform",
                email: env.SMTP_FROM || env.SMTP_MAIL
            },
            to: [{ email: to }],
            subject: subject,
            textContent: text,
            htmlContent: html || text
        });

        const options = {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'api-key': env.SMTP_PASSWORD,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`Email sent successfully via Brevo HTTP API (Bypassing Render Port Block)`);
                    resolve(true);
                } else {
                    console.error("Brevo API Error:", data);
                    reject(new Error("Failed to send email"));
                }
            });
        });

        req.on('error', (e) => {
            console.error("Network error sending email:", e);
            reject(new Error("Network error"));
        });

        req.write(payload);
        req.end();
    });
};

module.exports = {
    sendEmail,
};
