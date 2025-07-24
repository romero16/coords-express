
const sessionSocketMap = new Map();

module.exports = {
  setSocket(sessionId, socket) {
    sessionSocketMap.set(sessionId, socket);
  },

  getSocket(sessionId) {
    return sessionSocketMap.get(sessionId);
  },

  deleteSocket(sessionId) {
    sessionSocketMap.delete(sessionId);
  },

  getAllSockets() {
    return Array.from(sessionSocketMap.entries());
  },

  getAllSessionIds() {
    return Array.from(sessionSocketMap.keys());
  },
};
