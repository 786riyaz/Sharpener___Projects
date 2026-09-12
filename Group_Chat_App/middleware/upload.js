const multer = require("multer");
// Exercise 16: keep a bounded upload size so one request cannot exhaust
// the Node.js process. The frontend validates before upload as well.
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
const allowedMimePrefixes = ["image/", "video/", "audio/"];
const allowedMimeTypes = new Set([
"application/pdf",
"application/zip",
"application/x-zip-compressed",
"text/plain",
"application/msword",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
"application/vnd.ms-excel",
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
"application/vnd.ms-powerpoint",
"application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);
function isAllowedFile(file) {
return allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix))
|| allowedMimeTypes.has(file.mimetype);
}
const upload = multer({
storage: multer.memoryStorage(),
limits: {
fileSize: MAX_FILE_SIZE,
files: 10
},
fileFilter: (req, file, callback) => {
if (!isAllowedFile(file)) {
return callback(new Error("This file type is not supported"));
}
callback(null, true);
}
});
module.exports = { upload, MAX_FILE_SIZE, isAllowedFile };