const multer = require("multer");

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const allowedMimePrefixes = ["image/", "video/", "audio/"];
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, callback) => {
    const allowed = allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix))
      || allowedMimeTypes.has(file.mimetype);

    if (!allowed) {
      return callback(new Error("This file type is not supported"));
    }

    callback(null, true);
  }
});

module.exports = upload;
