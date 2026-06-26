import { App, type SlackEventMiddlewareArgs } from "@slack/bolt";
import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import type { Channel, OutboundMedia, Recipient } from "../types/channel";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";

let app: App | null = null;

export function createSlackChannel(): Channel | null {
  const config = getConfig();
  const sl = config.channels.slack;
  if (!sl.enabled || !sl.bot_token || !sl.app_token) return null;

  return {
    name: "slack",

    async start() {
      app = new App({
        token: sl.bot_token!,
        socketMode: true,
        appToken: sl.app_token!,
      });

      app.message(async ({ message, say, client, context }: SlackEventMiddlewareArgs<"message">) => {
        if (message.subtype && message.subtype !== "bot_message") return;
        if (message.bot_id) return;

        const text = "text" in message ? message.text : "";
        if (!text) return;

        const channelId = message.channel as string;
        const threadTs = message.thread_ts || message.ts;
        const userId = message.user as string;
        const room = `slack-${channelId}`;

        const engine = await createChatEngine({
          room,
          channel: "slack",
          resume: true,
          mcpServers: getMcpServers({ channel: "slack", room, slackChannelId: channelId, slackThreadTs: threadTs }),
        });

        let lastStreamed = "";
        const result = await engine.send(text, {
          onStream(accumulated) {
            lastStreamed = accumulated;
          },
          onActivity() {
            // Could set typing indicator
          },
        });

        await engine.close();

        if (result.result) {
          await say({ text: result.result, thread_ts: threadTs as string });
        }
      });

      await app.start();
      log.info("slack bot started");
    },

    async stop() {
      if (app) {
        try {
          await app.stop();
        } catch {}
        app = null;
      }
    },

    async send(recipient: Recipient, message: OutboundMedia): Promise<boolean> {
      if (!app) return false;
      try {
        await app.client.chat.postMessage({
          channel: recipient.id,
          text: message.text || "",
          ...(message.filePath ? { attachments: [{ fallback: "attachment", image_url: message.filePath }] } : {}),
        });
        return true;
      } catch (err) {
        log.error({ err }, "slack send failed");
        return false;
      }
    },

    isAvailable() {
      return app !== null;
    },
  };
}
