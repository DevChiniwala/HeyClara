import postgres from "postgres";
import { getConfig } from "../utils/config";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = getConfig().database_url;
    if (!url || !url.startsWith("postgres")) {
      throw new Error(`Invalid database_url: "${url || "(empty)"}". Expected a postgres:// connection string.`);
    }
    _sql = postgres(url, { onnotice: () => {} });
  }
  return _sql;
}

export async function closeDb(): Promise<void> {
  if (_sql) {
    await _sql.end();
    _sql = null;
  }
}
