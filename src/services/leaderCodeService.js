const crypto = require("crypto");

const User = require("../models/User");

const generateLeaderCode = () => {
    return `LDR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const createUniqueLeaderCode = async () => {

    while (true) {

        const code = generateLeaderCode();

        const exists = await User.exists({
            leaderCode: code
        });

        if (!exists) {
            return code;
        }
    }

};

module.exports = {
    createUniqueLeaderCode
};