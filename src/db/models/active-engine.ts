import { getSql } from "../connection";

export async function register(room: string, channel: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO active_engines (room, channel)
    VALUES (${room}, ${channel})
    ON CONFLICT (room) DO UPDATE SET last_ping = NOW()
  `;
}

export async function unregister(room: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM active_engines WHERE room = ${room}`;
}

export async function list(): Promise<Array<{ room: string; channel: string; startedAt: string }>> {
  const sql = getSql();
  const rows = await sql`
    SELECT room, channel, started_at FROM active_engines ORDER BY started_at
  `;
  return rows.map((r) => ({
    room: r.room,
    channel: r.channel,
    startedAt: String(r.started_at),
  }));
}

export async function clearAll(): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM active_engines`;
}

export async function count(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM active_engines`;
  return rows[0]?.count ?? 0;
}
