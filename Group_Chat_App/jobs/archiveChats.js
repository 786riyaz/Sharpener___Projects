const cron = require("cron");
const Message = require("../models/Message");
const ArchivedChat = require("../models/ArchivedChat");
const ARCHIVE_AFTER_HOURS = Number(process.env.ARCHIVE_AFTER_HOURS || 24);
const BATCH_SIZE = Number(process.env.ARCHIVE_BATCH_SIZE || 1000);
const CRON_SCHEDULE = process.env.ARCHIVE_CRON_SCHEDULE || "0 0 * * *";
function getCutoffDate() {
return new Date(Date.now() - ARCHIVE_AFTER_HOURS * 60 * 60 * 1000);
}
async function archiveOldChats() {
const cutoff = getCutoffDate();
let moved = 0;
let lastId = null;
try {
while (true) {
const query = { createdAt: { $lt: cutoff } };
if (lastId) query._id = { $gt: lastId };
const oldMessages = await Message.find(query)
.sort({ _id: 1 })
.limit(BATCH_SIZE)
.lean();
if (!oldMessages.length) break;
lastId = oldMessages[oldMessages.length - 1]._id;
const archiveOperations = oldMessages.map((message) => ({
updateOne: {
filter: { originalMessageId: message._id },
update: {
$setOnInsert: {
originalMessageId: message._id,
chatType: message.chatType,
roomId: message.roomId,
groupId: message.groupId || null,
sender: message.sender,
text: message.text || "",
media: message.media || {},
originalCreatedAt: message.createdAt,
originalUpdatedAt: message.updatedAt,
archivedAt: new Date()
}
},
upsert: true
}
}));
// Upsert first. Active messages are deleted only after the archive write succeeds.
await ArchivedChat.bulkWrite(archiveOperations, { ordered: false });
const ids = oldMessages.map((message) => message._id);
const deleteResult = await Message.deleteMany({ _id: { $in: ids } });
moved += deleteResult.deletedCount;
if (oldMessages.length < BATCH_SIZE) break;
}
console.log(`[Archive] Completed. Moved ${moved} message(s) older than ${ARCHIVE_AFTER_HOURS} hour(s).`);
return { success: true, moved, cutoff };
} catch (error) {
console.error("[Archive] Failed:", error);
throw error;
}
}
function startArchiveJob() {
const job = new cron.CronJob(CRON_SCHEDULE, () => {
archiveOldChats().catch(() => {});
});
job.start();
console.log(`[Archive] Cron started: ${CRON_SCHEDULE} | archive after ${ARCHIVE_AFTER_HOURS} hours`);
return job;
}
module.exports = { archiveOldChats, startArchiveJob, getCutoffDate };