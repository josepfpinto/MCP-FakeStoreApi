import { User } from "../types";

export interface UserSession {
  user: User;
  sessionId: string;
  createdAt: Date;
}

export class SessionManager {
  private sessions = new Map<string, UserSession>();

  createSession(user: User): string {
    const sessionId = `sess_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const session: UserSession = {
      user,
      sessionId,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // For simplicity, we'll also store by user ID for easy lookup
    // In production, you might want more sophisticated session management
    this.sessions.set(`user_${user.id}`, session);

    console.log(
      `📝 SESSION: Created session ${sessionId} for user ${user.username}`
    );
    return sessionId;
  }

  getSession(sessionId: string): UserSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getSessionByUserId(userId: number): UserSession | null {
    return this.sessions.get(`user_${userId}`) || null;
  }

  // For MCP calls where we might not have explicit session info
  // We'll use the most recent session as a fallback
  // In production, you'd want proper session correlation
  getDefaultSession(): UserSession | null {
    const allSessions = Array.from(this.sessions.values());
    // Filter out user_X keys and only get actual sessions
    const realSessions = allSessions.filter((session) =>
      session.sessionId.startsWith("sess_")
    );

    if (realSessions.length === 0) {
      return null;
    }

    // Return most recent session
    return realSessions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.sessions.delete(`user_${session.user.id}`);
      console.log(`🗑️ SESSION: Removed session ${sessionId}`);
      return true;
    }
    return false;
  }

  // Clean up old sessions (could be called periodically)
  cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    for (const [key, session] of this.sessions) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(key);
      }
    }
  }
}
