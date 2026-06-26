import { getSql } from "../connection";

export async function enqueue(sessionId: string, room: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO finalization_requests (session_id, room)
    VALUES (${sessionId}, ${room})
    ON CONFLICT DO NOTHING
  `;
}

export async function dequeue(): Promise<{ id: number; sessionId: string; room: string } | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE finalization_requests SET status = 'processing', started_at = NOW()
    WHERE id = (
      SELECT id FROM finalization_requests
      WHERE status = 'pending'
      ORDER BY created_at ASC LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, session_id, room
  `;
  if (rows.length === 0) return null;
  return { id: rows[0].id, sessionId: rows[0].session_id, room: rows[0].room };
}

export async function complete(id: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE finalization_requests SET status = 'completed', completed_at = NOW() WHERE id = ${id}`;
}

export async function fail(id: number, error: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE finalization_requests SET status = 'failed', completed_at = NOW(), error = ${error} WHERE id = ${id}`;
}

export async function cancelPending(sessionId: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE finalization_requests SET status = 'cancelled' WHERE session_id = ${sessionId} AND status = 'pending'`;
}

export async function countPending(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM finalization_requests WHERE status = 'pending'`;
  return rows[0]?.count ?? 0;
}
