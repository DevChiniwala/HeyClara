import { Message, Session } from "../../db/models";

export async function listMessages(limit?: number, room?: string): Promise<string> {
  const messages = await Message.getRecent(limit || 20, room);
  if (messages.length === 0) return "No messages found.";
  return messages
    .map((m) => `[${m.createdAt}] ${m.sender}: ${m.content.slice(0, 200)}`)
    .join("\n");
}

export async function listSessions(limit?: number, room?: string): Promise<string> {
  const sessions = await Session.listRecent(limit || 10, room);
  if (sessions.length === 0) return "No sessions found.";
  return sessions
    .map((s) => {
      const preview = s.preview ? s.preview.slice(0, 100) : "(empty)";
      return `- **${s.id.slice(0, 12)}...** room=${s.room} msgs=${s.messageCount} preview="${preview}"`;
    })
    .join("\n");
}

export async function searchMessages(query: string, limit?: number, room?: string): Promise<string> {
  const results = await Message.search(query, limit || 20, room);
  if (results.length === 0) return "No matches found.";
  return results
    .map((r) => `[${r.createdAt}] ${r.sender} (room=${r.room}): ${r.content.slice(0, 200)}`)
    .join("\n");
}

export async function readSession(sessionId: string): Promise<string> {
  const messages = await Message.getBySession(sessionId);
  if (messages.length === 0) return "Session not found or empty.";
  return messages
    .map((m) => `${m.sender}: ${m.content}`)
    .join("\n");
}
