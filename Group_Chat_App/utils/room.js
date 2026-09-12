function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createPersonalRoomId(emailA, emailB) {
  return [normalizeEmail(emailA), normalizeEmail(emailB)].sort().join("::");
}

module.exports = { normalizeEmail, createPersonalRoomId };
