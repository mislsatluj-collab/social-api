const crypto = require("crypto");

const generateLeaderCode = () => {
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

    return `LDR-${randomPart}`;
};

module.exports = generateLeaderCode;