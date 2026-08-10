const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (pushTokens, title, body, data = {}) => {
    let messages = [];

    for (let pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title,
            body,
            data
        });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }

    return tickets;
};

module.exports = {
    sendPushNotification
};
