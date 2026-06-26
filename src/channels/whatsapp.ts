import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import type { Channel, OutboundMedia, Recipient } from "../types/channel";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";
import { registerTwilioHandler, getTwilioServer } from "./twilio/server";

export function createWhatsAppChannel(): Channel | null {
  const config = getConfig();
  const wa = config.channels.whatsapp;
  const twilio = config.channels.twilio;
  if (!wa.enabled || !twilio.sid || !twilio.secret) return null;

  const fromNumber = wa.from_number || "+14155238886";
  const ownerNumber = twilio.owner_number;

  return {
    name: "whatsapp",

    async start() {
      registerTwilioHandler({
        path: "/whatsapp",
        handle: async (body) => {
          const from = body.From as string;
          const text = body.Body as string;
          if (!from || !text) return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } });

          log.info({ from }, "whatsapp received");

          const room = `whatsapp-${from}`;
          const engine = await createChatEngine({
            room,
            channel: "whatsapp",
            resume: true,
            mcpServers: getMcpServers({ channel: "whatsapp", room }),
          });

          const result = await engine.send(text);
          await engine.close();

          if (result.result) {
            await sendWhatsApp(from, result.result);
          }

          return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } });
        },
      });

      await getTwilioServer().start();
    },

    async stop() {
      // Server is shared
    },

    async send(recipient: Recipient, message: OutboundMedia): Promise<boolean> {
      return sendWhatsApp(recipient.id, message.text || "");
    },

    isAvailable() {
      return true;
    },
  };
}

async function sendWhatsApp(to: string, text: string): Promise<boolean> {
  const config = getConfig();
  const twilio = config.channels.twilio;
  const fromNumber = config.channels.whatsapp.from_number || "+14155238886";
  if (!twilio.sid || !twilio.secret) return false;

  const waTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const waFrom = `whatsapp:${fromNumber}`;

  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilio.sid}:${twilio.secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: waTo, From: waFrom, Body: text }),
      },
    );
    return resp.ok;
  } catch (err) {
    log.error({ err }, "whatsapp send failed");
    return false;
  }
}
