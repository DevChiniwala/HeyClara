export interface ChatState {
  sessionId: string | null;
  messageCount: number;
  lastActivity: number | null;
  inFlight: boolean;
}
