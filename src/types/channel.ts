import type { Attachment } from "./attachment";

export interface Recipient {
  id: string;
  name?: string;
}

export interface Outbound {
  text: string;
  channel?: string;
  media_path?: string;
  target?: "auto" | "dm" | "thread";
}

export interface OutboundMedia {
  text?: string;
  filePath?: string;
  buffer?: Buffer;
  fileName?: string;
  mimeType?: string;
}

export interface Channel {
  name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  send(recipient: Recipient, message: OutboundMedia): Promise<boolean>;
  isAvailable(): boolean;
}

export type ChannelFactory = () => Channel | null;
