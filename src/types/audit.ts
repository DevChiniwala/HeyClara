export interface AuditEntry {
  job: string;
  timestamp: string;
  status: string;
  result: string;
  duration_ms: number;
  session_id?: string;
  terminal_reason?: string;
  error?: string;
}

export interface JobState {
  lastRun: string;
  status: string;
  duration_ms: number;
  error?: string;
}

export interface CronState {
  [jobName: string]: JobState;
}
