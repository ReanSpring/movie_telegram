class SessionService {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Set session for a user
   */
  setSession(userId, data) {
    this.sessions.set(userId, {
      ...data,
      timestamp: Date.now()
    });
  }

  /**
   * Get session for a user
   */
  getSession(userId) {
    const session = this.sessions.get(userId);
    // Session expires after 30 minutes
    if (session && Date.now() - session.timestamp > 30 * 60 * 1000) {
      this.sessions.delete(userId);
      return null;
    }
    return session;
  }

  /**
   * Clear session for a user
   */
  clearSession(userId) {
    this.sessions.delete(userId);
  }
}

module.exports = new SessionService();
