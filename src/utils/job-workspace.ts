const VALID_JOB_NAME = /^[a-zA-Z0-9_-]+$/;

export function validateJobName(name: string): void {
  if (!name || name.length < 1) throw new Error("Job name must not be empty");
  if (!VALID_JOB_NAME.test(name)) throw new Error(`Invalid job name "${name}": only letters, numbers, hyphens, and underscores allowed`);
  if (name.length > 64) throw new Error(`Job name too long: "${name}" (max 64 chars)`);
}
