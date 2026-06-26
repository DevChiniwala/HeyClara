import { getConfig } from "../../utils/config";
import { getWatchBehavior, parseWatchKey } from "../../utils/watches";
import { log } from "../../utils/log";
import { createChatEngine } from "../../chat/engine";
import { getMcpServers } from "../../mcp";

export interface WatchMessage {
  channelId: string;
  channelName: string;
  userId: string;
  text: string;
  ts: string;
}

export async function handleWatchMessage(msg: WatchMessage): Promise<void> {
  const config = getConfig();
  const watches = config.channels.slack.watch;
  if (!watches) return;

  for (const [key, watchConfig] of Object.entries(watches)) {
    if (!watchConfig.enabled) continue;

    const { channelId } = parseWatchKey(key);
    if (channelId !== msg.channelId) continue;

    const behavior = getWatchBehavior(msg.channelName, watchConfig.behavior);
    if (!behavior) continue;

    log.info({ channel: msg.channelName, user: msg.userId }, "watch channel message");

    const room = `watch-${key}`;
    const engine = await createChatEngine({
      room,
      channel: "slack",
      resume: false,
      mcpServers: getMcpServers({ channel: "slack", room, slackChannelId: msg.channelId, slackThreadTs: msg.ts }),
      watchBehavior: { channel: msg.channelName, behavior },
    });

    const result = await engine.send(msg.text);
    await engine.close();

    if (result.result && result.result !== "[NO_REPLY]") {
      try {
        const { default: SlackApp } = await import("@slack/bolt");
        const token = config.channels.slack.bot_token;
        if (token) {
          const client = new SlackApp({ token, signingSecret: "" }).client;
          await client.chat.postMessage({
            channel: msg.channelId,
            text: result.result,
            thread_ts: msg.ts,
          });
        }
      } catch (err) {
        log.error({ err }, "watch reply failed");
      }
    }
  }
}
