const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const AppError = require("../utils/AppError");

const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads/insurance");
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const userDirectory = path.join(UPLOAD_ROOT, String(req.user.id));
        fs.mkdirSync(userDirectory, { recursive: true });
        callback(null, userDirectory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .slice(0, 100) || "Insurance-policy";

        callback(null, `${crypto.randomUUID()}--${baseName}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_DOCUMENT_SIZE },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
            return callback(new AppError("Only PDF, DOC, and DOCX documents are allowed", 400));
        }

        callback(null, true);
    }
});

const uploadInsuranceDocument = (req, res, next) => {
    upload.single("policy")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Insurance policy document must be 5 MB or smaller"
                : "Invalid insurance policy document upload";

            return next(new AppError(message, 400));
        }

        return next(error);
    });
};

const getDocumentReference = (file, userId) => file
    ? path.posix.join("insurance", String(userId), file.filename)
    : undefined;

const removeUploadedFile = async (file) => {
    if (file) {
        await fs.promises.unlink(file.path).catch(() => undefined);
    }
};

module.exports = {
    UPLOAD_ROOT,
    getDocumentReference,
    removeUploadedFile,
    uploadInsuranceDocument
};
