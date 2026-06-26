-- HeyClara Database Schema
-- PostgreSQL schema for sessions, messages, jobs, active engines, and finalization.
-- All timestamps use TIMESTAMPTZ for timezone-aware operations.

-- Sessions represent a conversation between a user and Clara.
-- Each session has a unique backend session ID and belongs to a "room" (channel namespace).
-- metadata: JSONB accumulating cost/token tracking across turns.
-- summary: Optional handoff notes for session continuity.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  room        TEXT NOT NULL DEFAULT 'main',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  summary     TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sessions_room ON sessions(room, updated_at DESC);

-- Messages record every turn: user input and agent responses.
-- delivery_status tracks whether the message was successfully sent via the channel.
-- metadata: Backend-native metadata (cost, tokens, model usage) from the AI provider.
CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  room            TEXT NOT NULL DEFAULT 'main',
  sender          TEXT NOT NULL,
  content         TEXT NOT NULL,
  is_from_agent   BOOLEAN DEFAULT FALSE,
  delivery_status TEXT DEFAULT 'sent',
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_delivery ON messages(delivery_status, created_at ASC)
  WHERE delivery_status = 'failed' AND is_from_agent = true;
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages
  USING gin(to_tsvector('english', content));

-- Active engines track which rooms currently have a live agent session.
-- Used during graceful shutdown to wait for in-flight work.
CREATE TABLE IF NOT EXISTS active_engines (
  room        TEXT PRIMARY KEY,
  channel     TEXT NOT NULL,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  last_ping   TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs are scheduled or one-shot tasks Clara runs autonomously.
-- schedule_type: 'cron', 'interval', or 'once'
-- status: 'active', 'disabled', 'archived'
-- prompt: The instruction given to the agent for this job.
-- next_run_at / last_run_at: Computed schedule tracking.
-- always: If true, runs 24/7 ignoring active hours.
-- stateless: If true, disables working memory (no state.md injection).
-- agent / employee / model: Override references for persona or backend selection.
CREATE TABLE IF NOT EXISTS jobs (
  name            TEXT PRIMARY KEY,
  schedule        TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  schedule_type   TEXT NOT NULL DEFAULT 'cron',
  always          BOOLEAN DEFAULT FALSE,
  stateless       BOOLEAN DEFAULT FALSE,
  agent           TEXT,
  employee        TEXT,
  model           TEXT,
  next_run_at     TIMESTAMPTZ,
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_next_run ON jobs(next_run_at)
  WHERE status = 'active' AND next_run_at IS NOT NULL;

-- Finalization requests are enqueued after a session ends for async post-processing
-- (memory consolidation, summary generation). The daemon drains these via LISTEN/NOTIFY.
CREATE TABLE IF NOT EXISTS finalization_requests (
  id            SERIAL PRIMARY KEY,
  session_id    TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  room          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  error         TEXT
);

CREATE INDEX IF NOT EXISTS idx_finalization_pending ON finalization_requests(status, created_at ASC)
  WHERE status = 'pending';
