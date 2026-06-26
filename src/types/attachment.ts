export interface Attachment {
  type: "image" | "document" | "audio" | "video";
  data: Buffer | Uint8Array;
  mediaType: string;
  fileName?: string;
  source?: {
    type: "base64" | "url" | "path";
    media_type?: string;
    data?: string;
    url?: string;
    file_path?: string;
  };
}
