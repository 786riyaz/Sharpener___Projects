function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createPersonalRoomId(emailA, emailB) {
  const first = normalizeEmail(emailA);
  const second = normalizeEmail(emailB);

  if (!first || !second) {
    throw new Error("Both email addresses are required");
  }

  if (first === second) {
    throw new Error("You cannot create a personal chat with yourself");
  }

  return [first, second].sort().join("::");
}

module.exports = {
  normalizeEmail,
  createPersonalRoomId
};
