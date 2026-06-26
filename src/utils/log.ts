import pino from "pino";

const level = process.env.LOG_LEVEL || "info";

export const log = pino({
  level,
  transport:
    level === "silent"
      ? undefined
      : {
          target: "pino/file",
          options: { destination: 1 }, // stdout
        },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
