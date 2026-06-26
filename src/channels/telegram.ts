import { Bot } from "grammy";
import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import type { Channel, OutboundMedia, Recipient } from "../types/channel";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";

let bot: Bot | null = null;
let stopPolling = false;

export function createTelegramChannel(): Channel | null {
  const config = getConfig();
  const tg = config.channels.telegram;
  if (!tg.enabled || !tg.bot_token) return null;

  return {
    name: "telegram",

    async start() {
      bot = new Bot(tg.bot_token!);
      stopPolling = false;

      bot.on("message:text", async (ctx: any) => {
        const msg = ctx.message as Record<string, unknown> | undefined;
        const chat = ctx.chat as Record<string, unknown> | undefined;
        const text = (msg?.text as string) || "";
        const chatId = (chat?.id as number) || 0;
        const room = `telegram-${chatId}`;

        const engine = await createChatEngine({
          room,
          channel: "telegram",
          resume: true,
          mcpServers: getMcpServers({ channel: "telegram", room }),
        });

        let lastStreamed = "";
        const result = await engine.send(text, {
          onStream(accumulated) {
            const delta = accumulated.slice(lastStreamed.length);
            if (delta) lastStreamed = accumulated;
          },
          onActivity(activity) {
            // Could set typing indicator here
          },
        });

        await engine.close();

        if (result.result) {
          await ctx.reply(result.result);
        }
      });

      bot.start();
      log.info("telegram bot polling started");
    },

    async stop() {
      stopPolling = true;
      if (bot) {
        await bot.stop();
        bot = null;
      }
    },

    async send(recipient: Recipient, message: OutboundMedia): Promise<boolean> {
      if (!bot) return false;
      try {
        const chatId = parseInt(recipient.id, 10);
        if (message.filePath) {
          await bot.api.sendPhoto(chatId, message.filePath, { caption: message.text });
        } else {
          await bot.api.sendMessage(chatId, message.text || "");
        }
        return true;
      } catch (err) {
        log.error({ err }, "telegram send failed");
        return false;
      }
    },

    isAvailable() {
      return bot !== null;
    },
  };
}
