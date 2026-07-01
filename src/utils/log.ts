import pino from "pino";
import { getLogBroadcaster, initLogBroadcaster } from "./log-broadcaster";

const level = process.env.LOG_LEVEL || "info";

// Initialize broadcaster if not in test mode
if (!process.env.LOG_LEVEL?.includes("silent")) {
  initLogBroadcaster();
}

// Add WebSocket broadcaster as a pino stream
const broadcaster = getLogBroadcaster();
if (broadcaster) {
  // We'll handle broadcasting separately via the log-broadcaster module
  // This avoids pino transport complexity
}

export const log = pino({
  level,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
