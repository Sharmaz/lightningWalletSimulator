const rooms = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const ROOM_TIMEOUT_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > ROOM_TIMEOUT_MS) {
      rooms.delete(code);
    }
  }
}, 5 * 60 * 1000);

module.exports = { rooms, generateRoomCode };
