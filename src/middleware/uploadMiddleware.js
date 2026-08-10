const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload middleware
const createUploader = (folder) => {

    const uploadPath = path.join(
        __dirname,
        "../../uploads",
        folder
    );

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
            recursive: true
        });
    }

    const storage = multer.diskStorage({

        destination(req, file, cb) {
            cb(null, uploadPath);
        },

        filename(req, file, cb) {

            const extension = path.extname(file.originalname);

            const filename =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                extension;

            cb(null, filename);

        }

    });

    const fileFilter = (req, file, cb) => {

        const allowed = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error("Only JPG, PNG and WEBP images are allowed."));

    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    });

};

module.exports = createUploader;