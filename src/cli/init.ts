import { createInterface } from "readline/promises";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getPaths } from "../utils/paths";
import { readRawConfig, writeRawConfig } from "../utils/config";
import { runMigrations } from "../db/migrate";

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function ask(prompt: string, options?: { default?: string; secret?: boolean; required?: boolean }): Promise<string> {
  while (true) {
    const hint = options?.default ? ` [${options.default}]` : "";
    const answer = (await rl.question(`${prompt}${hint}: `)).trim() || options?.default || "";
    if (options?.required && !answer) {
      console.log("  This field is required.");
      continue;
    }
    return answer;
  }
}

async function askYesNo(prompt: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = (await rl.question(`${prompt} (${hint}): `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === "y" || answer === "yes";
}

export async function setupWizard(): Promise<void> {
  console.log("");
  console.log("  HeyClara Setup Wizard");
  console.log("  =====================");
  console.log("");
  console.log("  This will guide you through configuring Clara.");
  console.log("  Press Ctrl+C at any time to cancel.");
  console.log("");

  const paths = getPaths();
  const existing = readRawConfig();

  if (Object.keys(existing).length > 0) {
    const overwrite = await askYesNo("Config file exists. Reconfigure?", false);
    if (!overwrite) {
      console.log("  Setup cancelled.");
      rl.close();
      return;
    }
  }

  const config: Record<string, unknown> = {};

  // --- Database ---
  console.log("\n  -- Database --");
  const dbUrl = await ask("PostgreSQL connection string", {
    default: String(existing.database_url || "postgres://localhost:5432/clara"),
  });
  config.database_url = dbUrl;

  const testDb = await askYesNo("Test database connection and run migrations?", true);
  if (testDb) {
    try {
      process.env.DATABASE_URL = dbUrl;
      const postgres = await import("postgres");
      const sql = postgres.default(dbUrl, { onnotice: () => {} });
      await sql`SELECT 1`;
      console.log("  Database connected.");
      await runMigrations();
      console.log("  Migrations complete.");
      await sql.end();
    } catch (err) {
      console.log(`  Warning: Could not connect/migrate: ${err instanceof Error ? err.message : String(err)}`);
      console.log("  You can fix this later with 'clara db migrate'.");
    }
  }

  // --- Channels ---
  console.log("\n  -- Channels --");

  const channels: Record<string, unknown> = {};

  // Telegram
  const setupTelegram = await askYesNo("Set up Telegram?", false);
  if (setupTelegram) {
    const tgToken = await ask("Telegram bot token", { secret: true });
    const tgChatId = await ask("Telegram chat ID (numeric)");
    channels.telegram = {
      enabled: true,
      bot_token: tgToken || null,
      chat_id: tgChatId ? Number(tgChatId) : null,
    };
  }

  // Slack
  const setupSlack = await askYesNo("Set up Slack?", false);
  if (setupSlack) {
    const slackBotToken = await ask("Slack bot token (xoxb-...)", { secret: true });
    const slackAppToken = await ask("Slack app token (xapp-...)", { secret: true });
    const slackDmUser = await ask("Your Slack user/member ID");
    channels.slack = {
      enabled: true,
      bot_token: slackBotToken || null,
      app_token: slackAppToken || null,
      dm_user_id: slackDmUser || null,
    };
  }

  // Twilio (SMS/WhatsApp/Voice)
  const setupTwilio = await askYesNo("Set up Twilio (SMS/WhatsApp/Voice)?", false);
  if (setupTwilio) {
    const twilioSid = await ask("Twilio Account SID", { secret: true, required: true });
    const twilioSecret = await ask("Twilio Auth Token", { secret: true, required: true });
    const ownerNumber = await ask("Your phone number (E.164, e.g. +1234567890)");
    const publicBaseUrl = await ask("Public base URL for Twilio webhooks (e.g. https://example.com)");
    const twilioPort = await ask("Twilio webhook server port", { default: "7079" });

    const twilioConfig: Record<string, unknown> = {
      sid: twilioSid,
      secret: twilioSecret,
      owner_number: ownerNumber || null,
      public_base_url: publicBaseUrl || null,
      port: parseInt(twilioPort, 10) || 7079,
    };

    // SMS
    const setupSms = await askYesNo("Enable SMS?", false);
    if (setupSms) {
      const smsFrom = await ask("SMS from number", { default: ownerNumber });
      channels.sms = { enabled: true, from_number: smsFrom || null };
    }

    // WhatsApp
    const setupWhatsApp = await askYesNo("Enable WhatsApp?", false);
    if (setupWhatsApp) {
      channels.whatsapp = { enabled: true };
    }

    // Voice
    const setupVoice = await askYesNo("Enable phone voice calls?", false);
    if (setupVoice) {
      const voiceFrom = await ask("Voice from number", { default: ownerNumber });
      channels.phone = {
        enabled: true,
        from_number: voiceFrom || null,
      };
    }

    channels.twilio = twilioConfig;
  }

  config.channels = channels;

  // --- Finalize ---
  mkdirSync(paths.home, { recursive: true });
  mkdirSync(paths.selfDir, { recursive: true });
  mkdirSync(paths.tmpDir, { recursive: true });

  // Ensure persona files exist
  for (const file of ["rules.md", "memory.md"]) {
    const fpath = join(paths.selfDir, file);
    if (!existsSync(fpath)) writeFileSync(fpath, "");
  }

  writeRawConfig(config);

  console.log("\n  -- Setup Complete --");
  console.log(`  Config written to: ${paths.config}`);
  console.log("");
  console.log("  Next steps:");
  console.log("    clara start     Start the daemon");
  console.log("    clara chat      Start an interactive chat");
  console.log("    clara status    Check daemon status");
  console.log("    clara --help    See all available commands");

  rl.close();
}
