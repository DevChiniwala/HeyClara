import { withDb } from "../db/with-db";
import { Job } from "../db/models";
import { runJob } from "../core/runner";
import { computeInitialNextRun } from "../utils/schedule";
import { getConfig } from "../utils/config";
import { localTime } from "../utils/time";
import { fail, pass, ICON_PASS, ICON_WARN, DIM, RESET } from "../utils/cli";
import { errMsg } from "../utils/errors";
import { log } from "../utils/log";

export async function jobList(): Promise<void> {
  await withDb(async () => {
    const jobs = await Job.list();
    if (jobs.length === 0) { console.log("No jobs configured."); return; }
    console.log(`Jobs (${jobs.length}):`);
    for (const j of jobs) {
      const next = j.nextRunAt ? localTime(new Date(j.nextRunAt)) : "never";
      const last = j.lastRunAt ? localTime(new Date(j.lastRunAt)) : "never";
      const statusIcon = j.status === "active" ? ICON_PASS : ICON_WARN;
      console.log(`  ${statusIcon} ${j.name}: ${j.scheduleType} "${j.schedule}" [${j.status}] next: ${next} last: ${last}`);
    }
  });
}

export async function jobShow(name: string): Promise<void> {
  await withDb(async () => {
    const job = await Job.get(name);
    if (!job) fail(`Job "${name}" not found.`);
    console.log(`Name: ${job.name}`);
    console.log(`Schedule: ${job.scheduleType} "${job.schedule}"`);
    console.log(`Status: ${job.status}`);
    console.log(`Always: ${job.always}`);
    console.log(`Stateless: ${job.stateless}`);
    console.log(`Agent: ${job.agent || "(none)"}`);
    console.log(`Employee: ${job.employee || "(none)"}`);
    console.log(`Model: ${job.model || "(default)"}`);
    console.log(`Next run: ${job.nextRunAt ? localTime(new Date(job.nextRunAt)) : "never"}`);
    console.log(`Last run: ${job.lastRunAt ? localTime(new Date(job.lastRunAt)) : "never"}`);
    console.log(`\nPrompt:\n${DIM}${job.prompt.slice(0, 500)}${job.prompt.length > 500 ? "..." : ""}${RESET}`);
  });
}

export async function jobAdd(
  name: string, schedule: string, prompt: string,
  options: { scheduleType?: string; always?: boolean; agent?: string; employee?: string; model?: string; stateless?: boolean },
): Promise<void> {
  await withDb(async () => {
    try {
      const nextRun = computeInitialNextRun((options.scheduleType || "cron") as any, schedule, getConfig().timezone);
      await Job.create(
        name, schedule, prompt, options.always || false,
        (options.scheduleType || "cron") as any, nextRun ?? undefined,
        options.agent, options.stateless || false, options.model, options.employee,
      );
      pass(`Job "${name}" created.`);
    } catch (err) { fail(`Failed: ${errMsg(err)}`); }
  });
}

export async function jobUpdate(name: string, options: Record<string, unknown>): Promise<void> {
  await withDb(async () => {
    try {
      const updated = await Job.update(name, {
        schedule: options.schedule as string | undefined,
        prompt: options.prompt as string | undefined,
        status: options.status as any,
        always: options.always as boolean | undefined,
        agent: options.agent as string | null | undefined,
        employee: options.employee as string | null | undefined,
        model: options.model as string | null | undefined,
        stateless: options.stateless as boolean | undefined,
        scheduleType: options.scheduleType as any,
      });
      if (updated) pass(`Job "${name}" updated.`);
      else fail(`Job "${name}" not found.`);
    } catch (err) { fail(`Failed: ${errMsg(err)}`); }
  });
}

export async function jobRemove(name: string): Promise<void> {
  await withDb(async () => {
    const removed = await Job.remove(name);
    if (removed) pass(`Job "${name}" removed.`);
    else fail(`Job "${name}" not found.`);
  });
}

export async function jobEnable(name: string): Promise<void> {
  await withDb(async () => {
    const updated = await Job.update(name, { status: "active" });
    if (updated) pass(`Job "${name}" enabled.`);
    else fail(`Job "${name}" not found.`);
  });
}

export async function jobDisable(name: string): Promise<void> {
  await withDb(async () => {
    const updated = await Job.update(name, { status: "disabled" });
    if (updated) pass(`Job "${name}" disabled.`);
    else fail(`Job "${name}" not found.`);
  });
}

export async function jobRunNow(name: string): Promise<void> {
  await withDb(async () => {
    const job = await Job.get(name);
    if (!job) fail(`Job "${name}" not found.`);
    if (job.status !== "active") fail(`Job "${name}" is not active.`);

    pass(`Running job "${name}"...`);
    const result = await runJob(job);
    if (result.status === "ok") {
      pass(`Job "${name}" completed (${result.duration_ms}ms).`);
      if (result.result) console.log(result.result.slice(0, 500));
    } else {
      fail(`Job "${name}" failed: ${result.error}`);
    }
  });
}
