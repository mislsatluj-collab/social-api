const path = require("path");

const getFileUrl = (folder, filename) => {

    return `/uploads/${folder}/${filename}`;

};

const getFileName = (filePath) => {

    return path.basename(filePath);

};

module.exports = {
    getFileUrl,
    getFileName
};