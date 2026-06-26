import { CronExpressionParser } from "cron-parser";
import { parseDuration } from "./duration";
import type { ScheduleType } from "../types/enums";

export function computeInitialNextRun(type: ScheduleType, schedule: string, timezone: string): Date | null {
  if (type === "once") {
    const d = new Date(schedule);
    return isNaN(d.getTime()) ? null : d;
  }

  if (type === "cron") {
    try {
      const interval = CronExpressionParser.parse(schedule, { tz: timezone });
      return interval.next().toDate();
    } catch {
      return null;
    }
  }

  if (type === "interval") {
    try {
      return new Date(Date.now() + parseDuration(schedule));
    } catch {
      return null;
    }
  }

  return null;
}

export function computeNextRun(type: ScheduleType, schedule: string, timezone: string, from: Date): Date | null {
  if (type === "once") return null;

  if (type === "cron") {
    try {
      const interval = CronExpressionParser.parse(schedule, { tz: timezone, currentDate: from });
      return interval.next().toDate();
    } catch {
      return null;
    }
  }

  if (type === "interval") {
    try {
      return new Date(from.getTime() + parseDuration(schedule));
    } catch {
      return null;
    }
  }

  return null;
}
