import { homedir } from "os";
import { join } from "path";

const CLARA_HOME = join(homedir(), ".clara");

export interface ClaraPaths {
  home: string;
  config: string;
  selfDir: string;
  jobsDir: string;
  skillsDir: string;
  watchesDir: string;
  imagesDir: string;
  tmpDir: string;
  daemonLog: string;
  pidFile: string;
  stateFile: string;
  auditFile: string;
}

export function getPaths(): ClaraPaths {
  return {
    home: CLARA_HOME,
    config: join(CLARA_HOME, "config.yaml"),
    selfDir: join(CLARA_HOME, "self"),
    jobsDir: join(CLARA_HOME, "jobs"),
    skillsDir: join(CLARA_HOME, "skills"),
    watchesDir: join(CLARA_HOME, "watches"),
    imagesDir: join(CLARA_HOME, "images"),
    tmpDir: join(CLARA_HOME, "tmp"),
    daemonLog: join(CLARA_HOME, "tmp", "daemon.log"),
    pidFile: join(CLARA_HOME, "tmp", "clara.pid"),
    stateFile: join(CLARA_HOME, "tmp", "cron-state.json"),
    auditFile: join(CLARA_HOME, "tmp", "cron-audit.jsonl"),
  };
}

export function getClaraHome(): string {
  return CLARA_HOME;
}
