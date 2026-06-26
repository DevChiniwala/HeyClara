import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import type { Channel, OutboundMedia, Recipient } from "../types/channel";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";
import { registerTwilioHandler, getTwilioServer } from "./twilio/server";

export function createSmsChannel(): Channel | null {
  const config = getConfig();
  const sms = config.channels.sms;
  const twilio = config.channels.twilio;
  if (!sms.enabled || !twilio.sid || !twilio.secret) return null;

  const fromNumber = sms.from_number || twilio.owner_number;
  if (!fromNumber) return null;

  return {
    name: "sms",

    async start() {
      registerTwilioHandler({
        path: "/sms",
        handle: async (body) => {
          const from = body.From as string;
          const text = body.Body as string;
          if (!from || !text) return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } });

          log.info({ from }, "sms received");

          const room = `sms-${from}`;
          const engine = await createChatEngine({
            room,
            channel: "sms",
            resume: true,
            mcpServers: getMcpServers({ channel: "sms", room }),
          });

          const result = await engine.send(text);
          await engine.close();

          if (result.result) {
            await sendSms(from, result.result);
          }

          return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } });
        },
      });

      await getTwilioServer().start();
    },

    async stop() {
      // Server is shared; stop handled by channels/index.ts
    },

    async send(recipient: Recipient, message: OutboundMedia): Promise<boolean> {
      return sendSms(recipient.id, message.text || "");
    },

    isAvailable() {
      return true;
    },
  };
}

async function sendSms(to: string, text: string): Promise<boolean> {
  const config = getConfig();
  const twilio = config.channels.twilio;
  const fromNumber = config.channels.sms.from_number || twilio.owner_number;
  if (!twilio.sid || !twilio.secret || !fromNumber) return false;

  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilio.sid}:${twilio.secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: text }),
      },
    );
    return resp.ok;
  } catch (err) {
    log.error({ err }, "sms send failed");
    return false;
  }
}
