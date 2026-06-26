import { Session, Message } from "../../db/models";

export async function rotateRoom(prefix: string): Promise<string> {
  const maxIdx = await Session.getLatestRoomIndex(prefix);
  const nextIdx = maxIdx + 1;
  return `${prefix}-${nextIdx}`;
}

export async function saveChannelMessage(params: {
  sessionId: string;
  room: string;
  sender: string;
  content: string;
  isFromAgent: boolean;
}): Promise<number> {
  return Message.save(params);
}
