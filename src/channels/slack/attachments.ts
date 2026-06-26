import { getConfig } from "../../utils/config";
import { log } from "../../utils/log";

export async function uploadFile(channelId: string, filePath: string, fileName?: string): Promise<boolean> {
  const config = getConfig();
  const token = config.channels.slack.bot_token;
  if (!token) return false;

  try {
    const file = Bun.file(filePath);
    const formData = new FormData();
    formData.append("token", token);
    formData.append("channels", channelId);
    formData.append("file", file, fileName || filePath.split("/").pop() || "file");
    formData.append("title", fileName || "file");

    const resp = await fetch("https://slack.com/api/files.upload", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json() as { ok: boolean; error?: string };
    if (!data.ok) {
      log.error({ error: data.error }, "slack file upload failed");
      return false;
    }
    return true;
  } catch (err) {
    log.error({ err }, "slack file upload error");
    return false;
  }
}
