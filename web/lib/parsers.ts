export interface ParsedJob {
  name: string;
  scheduleType: string;
  schedule: string;
  status: string;
  nextRun: string;
  lastRun: string;
}

export interface ParsedSession {
  id: string;
  room: string;
  messageCount: number;
  preview: string;
}

export interface ParsedMessage {
  timestamp: string;
  sender: string;
  content: string;
}

export interface ParsedSessionMessage {
  sender: string;
  content: string;
}

export interface ParsedAgent {
  name: string;
  model: string | null;
}

export interface ParsedEmployee {
  name: string;
  role: string;
  project: string;
  model: string | null;
  disabled: boolean;
}

const JOB_RE = /^- \*\*(.+?)\*\*: type=(.+?) schedule="(.+?)" status=(.+?) next=(.+?) last=(.+?)$/;
const SESSION_RE = /^- \*\*(.{12})\.\.\.\*\* room=(.+?) msgs=(\d+) preview="(.*?)"$/;
const MESSAGE_RE = /^\[(.+?)\] (.+?): (.+)$/;
const AGENT_RE = /^- \*\*(.+?)\*\*(?: \(model: (.+?)\))?$/;
const EMPLOYEE_RE = /^- \*\*(.+?)\*\*: (.+?) @ (.+?)(?: \(model: (.+?)\))?(?: \[(.+?)\])?$/;

export function parseJobs(markdown: string): ParsedJob[] {
  if (!markdown || markdown === "No jobs configured.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(JOB_RE);
    if (!m) return null;
    return { name: m[1], scheduleType: m[2], schedule: m[3], status: m[4], nextRun: m[5], lastRun: m[6] };
  }).filter((j): j is ParsedJob => j !== null);
}

export function parseSessions(markdown: string): ParsedSession[] {
  if (!markdown || markdown === "No sessions found.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(SESSION_RE);
    if (!m) return null;
    return { id: m[1], room: m[2], messageCount: parseInt(m[3], 10), preview: m[4] };
  }).filter((s): s is ParsedSession => s !== null);
}

export function parseMessages(markdown: string): ParsedMessage[] {
  if (!markdown || markdown === "No messages found.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(MESSAGE_RE);
    if (!m) return null;
    return { timestamp: m[1], sender: m[2], content: m[3] };
  }).filter((msg): msg is ParsedMessage => msg !== null);
}

export function parseSessionMessages(markdown: string): ParsedSessionMessage[] {
  if (!markdown || markdown === "Session not found or empty.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const idx = line.indexOf(": ");
    if (idx === -1) return null;
    return { sender: line.slice(0, idx), content: line.slice(idx + 2) };
  }).filter((msg): msg is ParsedSessionMessage => msg !== null);
}

export function parseAgents(markdown: string): ParsedAgent[] {
  if (!markdown || markdown === "No agents configured.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(AGENT_RE);
    if (!m) return null;
    return { name: m[1], model: m[2] || null };
  }).filter((a): a is ParsedAgent => a !== null);
}

export function parseEmployees(markdown: string): ParsedEmployee[] {
  if (!markdown || markdown === "No employees configured.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(EMPLOYEE_RE);
    if (!m) return null;
    return { name: m[1], role: m[2], project: m[3], model: m[4] || null, disabled: m[5] === "disabled" };
  }).filter((e): e is ParsedEmployee => e !== null);
}

export interface ParsedEngine {
  room: string;
  channel: string;
  startedAt: string;
}

const ENGINE_RE = /^- \*\*(.+?)\*\*: channel=(.+?) startedAt=(.+?)$/;

export function parseEngines(markdown: string): ParsedEngine[] {
  if (!markdown || markdown === "No active engines.") return [];
  return markdown.split("\n").filter(Boolean).map((line) => {
    const m = line.match(ENGINE_RE);
    if (!m) return null;
    return { room: m[1], channel: m[2], startedAt: m[3] };
  }).filter((e): e is ParsedEngine => e !== null);
}
