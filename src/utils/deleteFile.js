const fs = require("fs");

const deleteFile = (filePath) => {

    if (!filePath) return;

    const fullPath = "." + filePath;

    if (fs.existsSync(fullPath)) {

        fs.unlinkSync(fullPath);

    }

};

module.exports = deleteFile;