import { z } from "zod";
import * as handlers from "./index";
import type { NiaTool } from "./types";

export const CLARA_TOOLS: NiaTool[] = [
  {
    name: "list_jobs",
    description: "List all scheduled jobs with status and next run time",
    schema: {},
    handler: () => handlers.listJobs(),
  },
  {
    name: "add_job",
    description: "Create a new scheduled job. Supports cron, interval, or one-shot.",
    schema: {
      name: z.string().describe("Unique job name"),
      schedule: z.string().describe("Cron expression, duration string, or ISO timestamp"),
      prompt: z.string().describe("What the job should do"),
      schedule_type: z.enum(["cron", "interval", "once"]).default("cron").describe("Schedule type"),
      always: z.boolean().default(false).describe("Run 24/7 ignoring active hours"),
      agent: z.string().optional().describe("Agent name to use"),
      employee: z.string().optional().describe("Employee name to use"),
      stateless: z.boolean().default(false).describe("Disable working memory"),
      model: z.string().optional().describe("Model override"),
    },
    handler: (args) => handlers.addJob(args),
  },
  {
    name: "update_job",
    description: "Update an existing job. Only pass fields to change.",
    schema: {
      name: z.string().describe("Job name"),
      schedule: z.string().optional(),
      prompt: z.string().optional(),
      always: z.boolean().optional(),
      agent: z.string().nullable().optional(),
      employee: z.string().nullable().optional(),
      model: z.string().nullable().optional(),
      stateless: z.boolean().optional(),
      schedule_type: z.enum(["cron", "interval", "once"]).optional(),
    },
    handler: (args) => handlers.updateJob(args),
  },
  {
    name: "remove_job",
    description: "Delete a job",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.removeJob(args.name),
  },
  {
    name: "enable_job",
    description: "Enable a disabled job",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.enableJob(args.name),
  },
  {
    name: "disable_job",
    description: "Disable a job",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.disableJob(args.name),
  },
  {
    name: "archive_job",
    description: "Archive a job (won't run). Use unarchive_job to restore.",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.archiveJob(args.name),
  },
  {
    name: "unarchive_job",
    description: "Unarchive a job back to disabled state",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.unarchiveJob(args.name),
  },
  {
    name: "run_job",
    description: "Trigger a job to run immediately",
    schema: { name: z.string().describe("Job name") },
    handler: (args) => handlers.runJobNow(args.name),
  },
  {
    name: "send_message",
    description: "Send a message via configured channel",
    schema: {
      text: z.string().describe("Message text"),
      channel: z.string().optional().describe("Channel name (telegram, slack)"),
      media_path: z.string().optional().describe("File path to attach"),
      target: z.enum(["auto", "dm", "thread"]).default("auto"),
    },
    handler: (args, ctx) => handlers.sendMessage(args.text, args.channel, args.media_path, ctx, args.target),
  },
  {
    name: "list_messages",
    description: "Read recent chat history",
    schema: {
      limit: z.number().default(20),
      room: z.string().optional(),
    },
    handler: (args) => handlers.listMessages(args.limit, args.room),
  },
  {
    name: "list_sessions",
    description: "Browse past conversation sessions",
    schema: {
      room: z.string().optional(),
      limit: z.number().default(10),
    },
    handler: (args) => handlers.listSessions(args.limit, args.room),
  },
  {
    name: "search_messages",
    description: "Search across all past messages by keyword",
    schema: {
      query: z.string().describe("Search text"),
      room: z.string().optional(),
      limit: z.number().default(20),
    },
    handler: (args) => handlers.searchMessages(args.query, args.limit, args.room),
  },
  {
    name: "read_session",
    description: "Load the full transcript of a specific session",
    schema: { session_id: z.string().describe("Session ID") },
    handler: (args) => handlers.readSession(args.session_id),
  },
  {
    name: "add_watch_channel",
    description: "Add or update a Slack watch channel",
    schema: {
      name: z.string().describe("Slack channel key (e.g. C123#general)"),
      behavior: z.string().optional().describe("Behavior text or watch dir name"),
    },
    handler: (args) => handlers.addWatchChannel(args.name, args.behavior),
  },
  {
    name: "remove_watch_channel",
    description: "Remove a Slack watch channel",
    schema: { name: z.string().describe("Channel key") },
    handler: (args) => handlers.removeWatchChannel(args.name),
  },
  {
    name: "enable_watch_channel",
    description: "Enable a Slack watch channel",
    schema: { name: z.string().describe("Channel key") },
    handler: (args) => handlers.enableWatchChannel(args.name),
  },
  {
    name: "disable_watch_channel",
    description: "Disable a Slack watch channel",
    schema: { name: z.string().describe("Channel key") },
    handler: (args) => handlers.disableWatchChannel(args.name),
  },
  {
    name: "add_rule",
    description: "Add a behavioral rule (loaded every session)",
    schema: { rule: z.string().describe("The rule text") },
    handler: (args) => handlers.addRuleTool(args.rule),
  },
  {
    name: "read_memory",
    description: "Read all saved memories",
    schema: {},
    handler: () => handlers.readMemoryTool(),
  },
  {
    name: "add_memory",
    description: "Save a concise factual memory (max 300 chars)",
    schema: {
      entry: z.string().max(300).describe("Single concise insight"),
    },
    handler: (args) => handlers.addMemoryTool(args.entry),
  },
  {
    name: "list_agents",
    description: "List all available agents",
    schema: {},
    handler: () => handlers.listAgentsTool(),
  },
  {
    name: "list_employees",
    description: "List all employees",
    schema: {},
    handler: () => handlers.listEmployeesTool(),
  },
  {
    name: "place_call",
    description: "Place an outbound phone call (requires Twilio voice)",
    schema: {
      number: z.string().describe("E.164 phone number"),
      goal: z.string().describe("What the call should accomplish"),
      context: z.string().optional(),
      max_minutes: z.number().optional(),
      voice: z.string().optional(),
    },
    handler: (args) => handlers.placeCall(args),
  },
];
