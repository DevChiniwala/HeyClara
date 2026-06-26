import { Job } from "../../db/models";
import { computeInitialNextRun } from "../../utils/schedule";
import { getConfig } from "../../utils/config";
import { formatDuration } from "../../utils/duration";
import { log } from "../../utils/log";

export async function listJobs(): Promise<string> {
  const jobs = await Job.list();
  if (jobs.length === 0) return "No jobs configured.";
  return jobs
    .map((j) => {
      const next = j.nextRunAt ? new Date(j.nextRunAt).toLocaleString() : "never";
      const last = j.lastRunAt ? new Date(j.lastRunAt).toLocaleString() : "never";
      return `- **${j.name}**: type=${j.scheduleType} schedule="${j.schedule}" status=${j.status} next=${next} last=${last}`;
    })
    .join("\n");
}

export async function addJob(args: Record<string, unknown>): Promise<string> {
  const name = args.name as string;
  const schedule = args.schedule as string;
  const prompt = args.prompt as string;
  const scheduleType = (args.schedule_type as string) || "cron";
  const always = (args.always as boolean) || false;
  const agent = args.agent as string | undefined;
  const employee = args.employee as string | undefined;
  const stateless = (args.stateless as boolean) || false;
  const model = args.model as string | undefined;

  try {
    const nextRun = computeInitialNextRun(scheduleType as any, schedule, getConfig().timezone);
    await Job.create(name, schedule, prompt, always, scheduleType as any, nextRun ?? undefined, agent, stateless, model, employee);
    return `Job "${name}" created successfully.`;
  } catch (err) {
    return `Failed to create job: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function updateJob(args: Record<string, unknown>): Promise<string> {
  const name = args.name as string;
  try {
    const updated = await Job.update(name, {
      schedule: args.schedule as string | undefined,
      prompt: args.prompt as string | undefined,
      status: args.status as any,
      always: args.always as boolean | undefined,
      agent: args.agent as string | null | undefined,
      employee: args.employee as string | null | undefined,
      model: args.model as string | null | undefined,
      stateless: args.stateless as boolean | undefined,
      scheduleType: args.schedule_type as any,
    });
    return updated ? `Job "${name}" updated.` : `Job "${name}" not found.`;
  } catch (err) {
    return `Failed to update job: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function removeJob(name: string): Promise<string> {
  const removed = await Job.remove(name);
  return removed ? `Job "${name}" removed.` : `Job "${name}" not found.`;
}

export async function enableJob(name: string): Promise<string> {
  const updated = await Job.update(name, { status: "active" });
  return updated ? `Job "${name}" enabled.` : `Job "${name}" not found.`;
}

export async function disableJob(name: string): Promise<string> {
  const updated = await Job.update(name, { status: "disabled" });
  return updated ? `Job "${name}" disabled.` : `Job "${name}" not found.`;
}

export async function archiveJob(name: string): Promise<string> {
  const updated = await Job.update(name, { status: "archived" });
  return updated ? `Job "${name}" archived.` : `Job "${name}" not found.`;
}

export async function unarchiveJob(name: string): Promise<string> {
  const updated = await Job.update(name, { status: "disabled" });
  return updated ? `Job "${name}" unarchived (disabled). Use enable to start.` : `Job "${name}" not found.`;
}

export async function runJobNow(name: string): Promise<string> {
  const job = await Job.get(name);
  if (!job) return `Job "${name}" not found.`;
  if (job.status !== "active") return `Job "${name}" is not active.`;

  log.info({ job: name }, "running job on demand");

  const { runJob } = await import("../../core/runner");
  runJob(job).catch((err) => {
    log.error({ err, job: name }, "on-demand job execution failed");
  });

  return `Job "${name}" triggered.`;
}
