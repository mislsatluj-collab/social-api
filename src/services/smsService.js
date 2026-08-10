const env = require("../config/env");

let twilioClient;

if (env.SMS_PROVIDER === "twilio") {
    try {
        const twilio = require("twilio");
        twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    } catch (err) {
        console.error("Twilio initialization failed:", err);
    }
}

const sendSMS = async ({ mobile, message }) => {
    try {
        switch (env.SMS_PROVIDER) {
            case "console":
                console.log("=================================");
                console.log("📱 SMS");
                console.log(`To      : ${mobile}`);
                console.log(`Message : ${message}`);
                console.log("=================================");
                break;

            case "twilio":
                if (!twilioClient) {
                    throw new Error("Twilio client is not initialized. Check your TWILIO credentials.");
                }
                
                const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

                await twilioClient.messages.create({
                    body: message,
                    from: env.TWILIO_PHONE_NUMBER,
                    to: formattedMobile
                });
                break;

            default:
                throw new Error("Unsupported SMS provider.");
        }

        return true;

    } catch (error) {
        console.error(`[SMS Error] Failed to send SMS via ${env.SMS_PROVIDER}:`, error.message);
        throw error;
    }
};

module.exports = {
    sendSMS
};