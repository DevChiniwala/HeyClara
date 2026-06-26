import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import type { Channel, OutboundMedia, Recipient } from "../types/channel";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";
import { registerTwilioHandler, getTwilioServer } from "./twilio/server";

const MAX_RESPONSE_LENGTH = 1500;

export function createVoiceChannel(): Channel | null {
  const config = getConfig();
  const phone = config.channels.phone;
  if (!phone.enabled || !phone.from_number) return null;
  const twilio = config.channels.twilio;
  if (!twilio.sid || !twilio.secret) return null;

  return {
    name: "voice",

    async start() {
      registerTwilioHandler({
        path: "/voice",
        handle: async (body) => {
          const from = body.From as string;
          if (!from) return twimlResponse("<Say>Missing caller information.</Say><Hangup/>");

          log.info({ from }, "voice call received");

          const room = `voice-${from}`;
          const engine = await createChatEngine({
            room,
            channel: "voice",
            resume: true,
            mcpServers: getMcpServers({ channel: "voice", room }),
          });

          const greeting = await engine.send(""); // empty to get greeting/intro
          await engine.close();

          const intro = greeting?.result ? stripMarkdown(greeting.result) : "Hello, I am Clara. How can I help you?";
          const introChunks = chunkText(intro);

          return twimlResponse(
            `<Gather input="speech" speechTimeout="${phone.speech_timeout}" language="${phone.stt_language}" action="/voice/process" method="POST">` +
              introChunks.map((c) => `<Say>${escapeXml(c)}</Say>`).join("") +
            `</Gather>` +
            `<Redirect>/voice/process</Redirect>`,
          );
        },
      });

      registerTwilioHandler({
        path: "/voice/process",
        handle: async (body) => {
          const from = body.From as string;
          const speechResult = (body.SpeechResult as string) || "";
          const digits = (body.Digits as string) || "";
          const input = speechResult || digits;

          if (!from) return twimlResponse("<Say>Error processing your request.</Say><Hangup/>");

          const room = `voice-${from}`;
          const engine = await createChatEngine({
            room,
            channel: "voice",
            resume: true,
            mcpServers: getMcpServers({ channel: "voice", room }),
          });

          if (!input) {
            return twimlResponse(
              `<Say>I didn't catch that. Could you please repeat?</Say>` +
              `<Gather input="speech" speechTimeout="${phone.speech_timeout}" language="${phone.stt_language}" action="/voice/process" method="POST">` +
                `<Say>Go ahead, I'm listening.</Say>` +
              `</Gather>`,
            );
          }

          const result = await engine.send(input);
          await engine.close();

          if (!result?.result) {
            return twimlResponse(
              `<Say>I'm sorry, I couldn't process that. Let me try again.</Say>` +
              `<Gather input="speech" speechTimeout="${phone.speech_timeout}" language="${phone.stt_language}" action="/voice/process" method="POST">` +
                `<Say>Go ahead.</Say>` +
              `</Gather>`,
            );
          }

          const response = stripMarkdown(result.result);
          const chunks = chunkText(response);

          return twimlResponse(
            chunks.map((c) => `<Say>${escapeXml(c)}</Say>`).join("") +
            `<Gather input="speech" speechTimeout="${phone.speech_timeout}" language="${phone.stt_language}" action="/voice/process" method="POST">` +
              `<Say>Is there anything else I can help you with?</Say>` +
            `</Gather>` +
            `<Redirect>/voice/process</Redirect>`,
          );
        },
      });

      registerTwilioHandler({
        path: "/voice/say",
        handle: async (body) => {
          const text = (body.text as string) || "";
          if (!text) return twimlResponse("<Say>Hello from Clara.</Say><Hangup/>");
          const safe = escapeXml(stripMarkdown(text));
          const chunks = chunkText(safe);
          return twimlResponse(
            chunks.map((c) => `<Say>${c}</Say>`).join("") + `<Hangup/>`,
          );
        },
      });

      await getTwilioServer().start();
    },

    async stop() {
      // Server is shared
    },

    async send(recipient: Recipient, message: OutboundMedia): Promise<boolean> {
      return placeOutboundCall(recipient.id, message.text || "");
    },

    isAvailable() {
      return true;
    },
  };
}

export async function placeOutboundCall(to: string, text?: string): Promise<boolean> {
  const config = getConfig();
  const twilio = config.channels.twilio;
  const fromNumber = config.channels.phone.from_number;
  if (!twilio.sid || !twilio.secret || !fromNumber) return false;

  const baseUrl = twilio.public_base_url;
  if (!baseUrl) {
    log.warn("public_base_url not configured; cannot place outbound calls");
    return false;
  }

  const twimlUrl = text
    ? `${baseUrl}/voice/say?text=${encodeURIComponent(text)}`
    : `${baseUrl}/voice`;

  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilio.sid}:${twilio.secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Url: twimlUrl,
        }),
      },
    );
    return resp.ok;
  } catch (err) {
    log.error({ err }, "outbound call failed");
    return false;
  }
}

function twimlResponse(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(text: string): string[] {
  if (text.length <= MAX_RESPONSE_LENGTH) return [text];
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [text];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_RESPONSE_LENGTH && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
