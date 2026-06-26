/**
 * Shared Twilio webhook server. Runs on a configurable port and handles
 * inbound SMS and WhatsApp webhooks from Twilio.
 */
import { getConfig } from "../../utils/config";
import { log } from "../../utils/log";

let server: ReturnType<typeof Bun.serve> | null = null;

export interface TwilioHandler {
  path: string;
  handle: (body: Record<string, unknown>) => Promise<Response>;
}

const handlers: TwilioHandler[] = [];

export function registerTwilioHandler(handler: TwilioHandler): void {
  handlers.push(handler);
}

export function getTwilioServer() {
  return {
    start,
    stop,
    port: () => server?.port ?? 0,
  };
}

async function start(): Promise<void> {
  if (server) return;
  const config = getConfig();
  const port = config.channels.twilio.port;

  server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const text = await req.text();

      const params = new URLSearchParams(text);
      const body: Record<string, unknown> = {};
      for (const [key, value] of params) {
        body[key] = value;
      }

      for (const handler of handlers) {
        if (url.pathname === handler.path) {
          try {
            return await handler.handle(body);
          } catch (err) {
            log.error({ err, path: handler.path }, "twilio handler failed");
            return new Response("<Response/>", {
              status: 200,
              headers: { "Content-Type": "text/xml" },
            });
          }
        }
      }

      return new Response("Not found", { status: 404 });
    },
  });

  log.info({ port: server.port }, "twilio webhook server started");
}

function stop(): void {
  if (server) {
    server.stop();
    server = null;
    handlers.length = 0;
    log.info("twilio webhook server stopped");
  }
}
