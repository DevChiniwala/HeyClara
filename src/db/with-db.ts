import { closeDb, getSql } from "./connection";

export async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    return result;
  } finally {
    await closeDb();
  }
}
