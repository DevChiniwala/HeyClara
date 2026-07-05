/**
 * Shared test setup for DB tests.
 * Auto-creates the heyclara_test database if it doesn't exist,
 * points all config at it, and runs migrations.
 *
 * When DATABASE_URL is set (e.g. in CI), we derive admin and test URLs from it
 * so that credentials carry over. Otherwise we fall back to peer/trust auth
 * with OS-username or explicit 'postgres' user.
 */
import postgres from "postgres";
import { mkdirSync, rmSync } from "fs";
import { resetConfig } from "../../src/utils/config";
import { runMigrations } from "../../src/db/migrate";
import { closeDb } from "../../src/db/connection";

const TEST_HOME = `/tmp/clara-db-tests-${process.pid}`;
const TEST_DB_NAME = "heyclara_test";

/**
 * Derive admin and test DB URLs.
 * If DATABASE_URL is provided (CI), rewrite its path to /postgres (admin) and
 * /heyclara_test (test), preserving user/password/host.
 */
function deriveUrls(): { adminUrl: string; testDbUrl: string } {
  if (process.env.CLARA_TEST_ADMIN_URL && process.env.CLARA_TEST_DATABASE_URL) {
    return {
      adminUrl: process.env.CLARA_TEST_ADMIN_URL,
      testDbUrl: process.env.CLARA_TEST_DATABASE_URL,
    };
  }

  const baseUrl = process.env.DATABASE_URL;
  if (baseUrl) {
    try {
      const parsed = new URL(baseUrl);
      parsed.pathname = "/postgres";
      const adminUrl = process.env.CLARA_TEST_ADMIN_URL || parsed.toString();
      parsed.pathname = `/${TEST_DB_NAME}`;
      const testDbUrl = process.env.CLARA_TEST_DATABASE_URL || parsed.toString();
      return { adminUrl, testDbUrl };
    } catch {
      // Fall through to defaults if URL parsing fails
    }
  }

  return {
    adminUrl: process.env.CLARA_TEST_ADMIN_URL || "postgres://localhost:5432/postgres",
    testDbUrl: process.env.CLARA_TEST_DATABASE_URL || `postgres://localhost:5432/${TEST_DB_NAME}`,
  };
}

export async function setupTestDb(): Promise<void> {
  let { adminUrl, testDbUrl } = deriveUrls();

  // Auto-create test database if it doesn't exist
  let admin = postgres(adminUrl, { onnotice: () => {} });
  try {
    const rows =
      await admin`SELECT 1 FROM pg_database WHERE datname = ${TEST_DB_NAME}`;
    if (rows.length === 0) {
      await admin.unsafe(`CREATE DATABASE ${TEST_DB_NAME}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("role") && msg.includes("does not exist")) {
      // Retry with explicit postgres user for environments where the OS user role doesn't exist
      await admin.end({ timeout: 1 });
      const fallbackAdminUrl =
        process.env.CLARA_TEST_ADMIN_URL ||
          "postgres://postgres@localhost:5432/postgres";
      admin = postgres(fallbackAdminUrl, { onnotice: () => {} });
      const rows =
        await admin`SELECT 1 FROM pg_database WHERE datname = ${TEST_DB_NAME}`;
      if (rows.length === 0) {
        await admin.unsafe(`CREATE DATABASE ${TEST_DB_NAME}`);
      }
      // Also update test DB URL to use the same postgres user
      if (!process.env.CLARA_TEST_DATABASE_URL) {
        testDbUrl = `postgres://postgres@localhost:5432/${TEST_DB_NAME}`;
      }
    } else if (!msg.includes("already exists")) {
      throw err;
    }
  } finally {
    await admin.end();
  }

  // Point config at test DB
  mkdirSync(TEST_HOME, { recursive: true });
  process.env.CLARA_HOME = TEST_HOME;
  process.env.DATABASE_URL = testDbUrl;
  resetConfig();

  // Close any existing DB connection so getSql() re-creates it with the new URL
  await closeDb();
  await runMigrations();
}

export async function teardownTestDb(): Promise<void> {
  await closeDb();
  delete process.env.CLARA_HOME;
  delete process.env.DATABASE_URL;
  resetConfig();
  rmSync(TEST_HOME, { recursive: true, force: true });
}
