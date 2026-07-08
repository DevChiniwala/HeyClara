<div align="center">

  <img src="https://raw.githubusercontent.com/DevChiniwala/HeyClara/main/skills/clara-image/assets/clara-profile.webp" width="160" height="160" alt="HeyClara" style="border-radius: 50%;" />

  <h1>HeyClara</h1>
  <p><strong>Your personal AI daemon — fork it, mold it, make it yours.</strong></p>
  <p><em>A single-process AI assistant that runs scheduled jobs, chats across every channel, manages its own memory, and evolves with you.</em></p>

  <p>
    <a href="https://www.npmjs.com/package/@devchiniwala/heyclara"><img src="https://img.shields.io/npm/v/@devchiniwala/heyclara.svg?style=for-the-badge&color=6366f1" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@devchiniwala/heyclara"><img src="https://img.shields.io/npm/dm/@devchiniwala/heyclara.svg?style=for-the-badge&color=22c55e" alt="Downloads" /></a>
    <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Runtime-Bun-f472b6?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" /></a>
    <a href="https://github.com/DevChiniwala/HeyClara/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@devchiniwala/heyclara.svg?style=for-the-badge&color=eab308" alt="MIT" /></a>
    <a href="https://github.com/DevChiniwala/HeyClara"><img src="https://img.shields.io/github/stars/DevChiniwala/HeyClara?style=for-the-badge&color=f97316" alt="Stars" /></a>
  </p>

  <br/>

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/DevChiniwala/HeyClara/main/docs/architecture-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/DevChiniwala/HeyClara/main/docs/architecture-light.svg">
    <img alt="HeyClara Architecture" src="https://raw.githubusercontent.com/DevChiniwala/HeyClara/main/docs/architecture-light.svg" width="100%">
  </picture>

</div>

---

## What is HeyClara?

HeyClara is a **personal AI assistant daemon** powered by the Claude Agent SDK. It runs as a single background process on your machine, connecting to Telegram, Slack, Voice/SMS (Twilio), and your terminal — while autonomously running scheduled jobs, consolidating memory, and managing a deep persona system.

Unlike enterprise AI platforms with microservices and message queues, HeyClara is built for **one user**. It's small enough to read in an afternoon, runs as a single daemon, and acts as your personalized AI co-founder.

<br/>

<div align="center">

```
  You talk to Clara.    Clara remembers.    Clara works while you sleep.
       |                      |                        |
   Telegram/Slack       2-stage memory          Scheduled jobs
   Voice/SMS/CLI        consolidation           with working state
```

</div>

---

## Philosophy

| Principle | What it means |
|-----------|---------------|
| **Small enough to understand** | One process, one daemon. No microservices, no queues, no Kubernetes. |
| **Customization = code changes** | Want different behavior? Modify the source. The codebase is deliberately tiny. |
| **AI-Native** | No dashboards. You configure and debug by *talking* to Clara. |
| **Skills over features** | Instead of bloating core, you add `SKILL.md` folders that teach Clara new capabilities. |
| **Single-agent architecture** | One capable agent with tools beats multi-agent orchestration. [Research-backed.](MULTI_AGENT_PHILOSOPHY.md) |

---

## System Architecture

<div align="center">

```mermaid
graph TD
    classDef user stroke-width:2px,stroke:#6366f1,fill:#eef2ff,color:#312e81
    classDef daemon stroke-width:2px,stroke:#8b5cf6,fill:#f5f3ff,color:#4c1d95
    classDef ai stroke-width:2px,stroke:#10b981,fill:#ecfdf5,color:#064e3b
    classDef db stroke-width:2px,stroke:#f59e0b,fill:#fffbeb,color:#78350f
    classDef channel stroke-width:2px,stroke:#ec4899,fill:#fdf2f8,color:#831843

    User(("You")):::user

    subgraph Channels["External Channels"]
        direction LR
        Slack["Slack<br/>(Bolt + Socket Mode)"]:::channel
        Telegram["Telegram<br/>(grammY)"]:::channel
        Voice["Voice & SMS<br/>(Twilio + OpenAI)"]:::channel
        CLI["Terminal REPL"]:::channel
    end

    subgraph Daemon["HeyClara Daemon · Bun.js · Single Process"]
        direction TB
        Router{"Channel<br/>Router"}:::daemon
        Engine["Chat Engine<br/>(Sessions + Streaming)"]:::daemon
        Scheduler["Job Scheduler<br/>(Cron + Interval + Once)"]:::daemon
        MCP["MCP Tool Server<br/>(24 Tools)"]:::daemon
        Finalizer["Session Finalizer<br/>(Consolidator + Summarizer)"]:::daemon
        Alive["Alive Monitor<br/>(60s Heartbeat)"]:::daemon
        Identity["Identity Loader<br/>(Persona + Skills + Agents)"]:::daemon
    end

    subgraph AI["AI Layer"]
        Claude["Claude Agent SDK<br/>(query + streaming)"]:::ai
        Codex["Codex CLI<br/>(failover backend)"]:::ai
        Agents["Subagents<br/>(Marketer, Dev, Custom)"]:::ai
    end

    subgraph Persistence["Persistence Layer"]
        PG[("PostgreSQL<br/>Jobs · Messages · Sessions")]:::db
        FS[("~/.heyclara/<br/>Config · Persona · State")]:::db
    end

    User --> Slack & Telegram & Voice & CLI
    Slack & Telegram & Voice & CLI --> Router
    Router --> Engine
    Scheduler -.->|triggers| Engine

    Engine <--> Claude
    Claude <-->|failover| Codex
    Claude <--> Agents
    Claude <--> MCP

    Engine --> Finalizer
    Finalizer --> PG & FS
    MCP --> PG & FS
    Alive -.->|health checks| PG
    Identity -.->|loads| FS

    FS -.->|persona + config| Engine
```

</div>

---

## Data Flow: Message Lifecycle

<div align="center">

```mermaid
sequenceDiagram
    autonumber
    actor User as You
    participant Ch as Channel Adapter
    participant Eng as Chat Engine
    participant Id as Identity Loader
    participant SDK as Claude Agent SDK
    participant Tools as MCP Tools (24)
    participant DB as PostgreSQL
    participant Mem as Finalizer (Background)

    User->>Ch: Send message
    Ch->>Ch: Typing indicator / thinking emoji
    Ch->>Eng: Forward payload + attachments
    Eng->>Id: Load persona + skills + agents
    Id-->>Eng: System prompt assembled
    Eng->>DB: Load session history + room context
    Eng->>SDK: query(system + history + message)

    rect rgb(236, 253, 245)
        Note over SDK,Tools: Tool Use Loop (0..N iterations)
        SDK->>Tools: Invoke tool (add_memory, send_message, etc.)
        Tools->>DB: Execute (read/write)
        Tools-->>SDK: Tool result
    end

    SDK-->>Eng: Streamed text response
    Eng->>DB: Save messages (user + assistant)
    Eng-->>Ch: Stream to channel
    Ch-->>User: Final response delivered

    Note over Eng,Mem: Session goes idle (5 min timeout)
    Eng->>DB: Insert finalization_request
    DB-->>Mem: pg_notify('clara_finalize')
    Mem->>DB: Load transcript
    Mem->>Mem: Extract insights → staging.md
    Mem->>DB: Generate session summary
```

</div>

---

## Job Execution Flow

<div align="center">

```mermaid
flowchart LR
    classDef sched fill:#dbeafe,stroke:#2563eb,color:#1e3a5f
    classDef exec fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef state fill:#fef3c7,stroke:#d97706,color:#78350f

    Tick["Scheduler Tick<br/>(60s poll)"]:::sched
    Due{"Job due?<br/>active_hours<br/>check"}:::sched
    Load["Load Workspace<br/>~/.heyclara/jobs/name/"]:::exec
    Prompt["Assemble Prompt<br/>prompt.md > DB prompt<br/>+ state.md injection"]:::exec
    Run["Claude Agent SDK<br/>query() with MCP tools"]:::exec
    Result["Capture Result<br/>terminal_reason<br/>session_id"]:::exec
    State["Update state.md<br/>(working memory)"]:::state
    Audit["Write Audit Log<br/>+ next_run_at"]:::state

    Tick --> Due
    Due -->|Yes| Load
    Due -->|No / Outside hours| Tick
    Load --> Prompt --> Run --> Result
    Result --> State --> Audit --> Tick

    style Tick stroke-width:3px
```

</div>

---

## Two-Stage Memory System

<div align="center">

```mermaid
flowchart TB
    classDef stage1 fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    classDef stage2 fill:#fce7f3,stroke:#db2777,color:#831843
    classDef perm fill:#d1fae5,stroke:#059669,color:#064e3b

    Chat["Chat Session Ends"]:::stage1
    Consolidator["Consolidator<br/>Reflects on transcript"]:::stage1
    Staging["staging.md<br/>[1x] persona: loves coffee<br/>[2x] project: ships on Fridays<br/>[3x] correction: prefers terse replies"]:::stage1

    Promoter["Memory Promoter<br/>(Nightly 3 AM cron)"]:::stage2
    Filter{"count >= 2?<br/>older than 14d?"}:::stage2
    Reap["Reap stale entries<br/>(count < 2, age > 14d)"]:::stage2

    Memory["memory.md<br/>(permanent facts)"]:::perm
    Rules["rules.md<br/>(permanent behaviors)"]:::perm

    Chat --> Consolidator
    Consolidator -->|"append or bump count"| Staging
    Staging --> Promoter
    Promoter --> Filter
    Filter -->|Yes| Memory & Rules
    Filter -->|No| Reap

    style Staging stroke-width:3px
    style Memory stroke-width:3px
    style Rules stroke-width:3px
```

</div>

---

## Quick Start

```bash
# Install globally (requires Bun and PostgreSQL)
npm i -g @devchiniwala/heyclara

# Interactive setup — walks you through DB, API keys, channels, persona
clara init

# Start the background daemon
clara start

# Chat in your terminal
clara chat

# Check everything is healthy
clara health
```

<details>
<summary><strong>Manual Setup (without wizard)</strong></summary>

```bash
# 1. Clone and install
git clone https://github.com/DevChiniwala/HeyClara.git
cd HeyClara && bun install

# 2. Create the database
createdb heyclara

# 3. Create config at ~/.heyclara/config.yaml
cat > ~/.heyclara/config.yaml << 'EOF'
database_url: postgres://localhost:5432/heyclara
model: default
timezone: America/New_York
channels:
  enabled: true
  default: telegram
  telegram:
    enabled: true
    bot_token: YOUR_BOT_TOKEN
    chat_id: YOUR_CHAT_ID
EOF

# 4. Run in foreground (dev mode)
bun run dev
```

</details>

---

## Features

### Omni-Channel Presence

| Channel | Transport | Features |
|---------|-----------|----------|
| **Slack** | Bolt (Socket Mode) | Thread awareness, thinking emoji, file attachments (any MIME, up to 50MB), watch channels with hot-reload behaviors, `[NO_REPLY]` silent judgment |
| **Telegram** | grammY | Typing indicators, DM access from phone, open/closed mode |
| **Voice** | Twilio + OpenAI Realtime | Inbound/outbound calls, live audio bridge, tool use mid-call (consult Claude, send Telegram, save memory, end call) |
| **SMS** | Twilio | Inbound webhooks, `/reset` support, session rotation |
| **WhatsApp** | Twilio Sandbox | 24h customer-service window enforcement |
| **Terminal** | Built-in REPL | Rich CLI chat with streaming |

### Scheduled Jobs & Crons

- **Three schedule types:** cron expressions (`0 9 * * *`), intervals (`5m`, `2h`, `1d`), one-shot ISO timestamps
- **Active hours:** Jobs respect your defined hours; crons (`always: true`) run 24/7
- **Stateful workspaces:** Each job gets `~/.heyclara/jobs/<name>/` with `prompt.md` and `state.md`
- **Model routing:** Per-job model override (`haiku` for cheap parsing, `sonnet` for heavy logic)
- **Agent assignment:** Jobs can run under a specific agent's persona
- **Audit logging:** Every run captures `terminal_reason`, session ID, timing

### Employee System

Employees are persistent AI co-founders scoped to projects — not just role prompts, but full identities with their own memory, goals, decisions, and org chart position.

```
clara employee add          # Create new employee
clara employee list         # List all with status
clara employee pause <name> # Temporarily deactivate
clara employee <name>       # Chat as that employee
```

Lifecycle: `onboarding` → `active` → `paused`

### Two-Stage Memory & Persona

Clara lives in `~/.heyclara/self/` with five core files:

| File | Purpose |
|------|---------|
| `identity.md` | Who Clara is — name, personality, voice |
| `owner.md` | Who you are — context about the user |
| `soul.md` | Deep behavioral guidelines |
| `rules.md` | Live behavioral instructions (verbs) — hot-loaded every session |
| `memory.md` | Permanent facts (nouns) — hot-loaded every session |

**Stage 1 — Consolidation:** After a chat session goes idle, a background consolidator reflects on the transcript and appends candidate entries to `staging.md` with reinforcement counting (`[1x]`, `[2x]`, `[3x]`).

**Stage 2 — Promotion:** A nightly cron (3 AM) reaps entries older than 14 days with count < 2, and promotes qualifying candidates (count >= 2 + durability review) to permanent `memory.md` or `rules.md`.

### MCP Tool Server (24 Tools)

Clara exposes tools to the AI via the Model Context Protocol:

| Category | Tools |
|----------|-------|
| **Jobs** | `list_jobs`, `add_job`, `update_job`, `remove_job`, `enable_job`, `disable_job`, `archive_job`, `unarchive_job`, `run_job` |
| **Messaging** | `send_message` (with media, target routing), `list_messages`, `search_messages` |
| **Sessions** | `list_sessions`, `read_session` |
| **Memory** | `add_memory`, `read_memory`, `add_rule` |
| **Agents** | `list_agents`, `list_employees` |
| **Watch** | `add_watch_channel`, `remove_watch_channel`, `enable_watch_channel`, `disable_watch_channel` |
| **Voice** | `place_call` (outbound with goal, context, duration cap) |

### Harness-Agnostic Backends & Failover

```mermaid
flowchart LR
    classDef primary fill:#dbeafe,stroke:#2563eb
    classDef fallback fill:#fee2e2,stroke:#dc2626
    classDef tool fill:#d1fae5,stroke:#059669

    Request["Incoming<br/>Request"]
    Claude["Claude Agent SDK<br/>(Primary)"]:::primary
    Codex["Codex CLI<br/>(Fallback)"]:::fallback
    MCP["MCP Loopback<br/>Endpoint"]:::tool

    Request --> Claude
    Claude -->|"overload / 5xx"| Codex
    Claude <--> MCP
    Codex <-->|"HTTP"| MCP
```

- **Primary:** Claude Agent SDK (`query()` with streaming)
- **Fallback:** Codex CLI (auto-failover on persistent overload/5xx)
- **Shared tools:** Both backends connect to the same MCP tool server — no drift

### Alive Monitor & Self-Recovery

The daemon runs a 60-second heartbeat that checks health (version, daemon, config, DB, channels, API keys, persona, logs). On database failure:

1. Attempts reconnection
2. Deterministic Postgres recovery (stale PID removal + service restart)
3. LLM recovery agent as fallback for non-trivial issues
4. Notifies user with postmortem via Telegram/Slack

### 40+ Skills

Skills are modular `SKILL.md` folders that teach Clara new capabilities without touching core:

<details>
<summary><strong>View all skills</strong></summary>

| Skill | Description |
|-------|-------------|
| `agent-skill-creator` | Create new agent/skill definitions |
| `aws-cli` | AWS CLI operations |
| `clara-image` | Visual identity generation (Gemini) |
| `clara-phone` | Voice call management |
| `code-review` | Language-aware PR review |
| `codex` | Codex CLI integration |
| `content-strategy` | Content planning |
| `copywriting` | Professional copy |
| `cro` | Conversion rate optimization |
| `customer-research` | User research frameworks |
| `documents` | Document generation |
| `email` | Email composition |
| `frontend-design` | UI/UX patterns |
| `gh-stamp` | GitHub PR approval workflow |
| `github-link-repo-explorer` | Repository analysis |
| `google-workspace-cli` | Google Workspace operations |
| `image-generation` | General-purpose images (OpenAI + Gemini) |
| `marketing` | Marketing strategy |
| `modal-cli` | Modal deployment |
| `optimization-loop` | Iterative optimization |
| `optimize` | Performance optimization workspaces |
| `plan-review` | Plan critique |
| `product-marketing-context` | PMM frameworks |
| `programmatic-seo` | Scalable PSEO systems |
| `qa` | Quality assurance |
| `remotion` | Video generation |
| `render-cli` | Render.com deployment |
| `retro` | Sprint retrospectives |
| `seo` | Search optimization |
| `shopify` | E-commerce operations |
| `slack` | Slack messaging primitives |
| `svg-animations` | Animated SVGs |
| `taskmaster` | Task management |
| `userinterface-wiki` | UI documentation |
| `whisper-cpp-transcribe` | Audio transcription |
| `wrangler` | Cloudflare Workers |
| `yc-office-hours` | YC-style feedback |

</details>

---

## Tech Stack

<div align="center">

```mermaid
graph LR
    classDef runtime fill:#1a1a2e,stroke:#e94560,color:#eaeaea
    classDef lang fill:#16213e,stroke:#0f3460,color:#e94560
    classDef infra fill:#0f3460,stroke:#533483,color:#e94560
    classDef ai fill:#533483,stroke:#e94560,color:#eaeaea

    Bun["Bun.js"]:::runtime
    TS["TypeScript<br/>(Strict)"]:::lang
    PG["PostgreSQL"]:::infra
    Claude["Claude Agent SDK"]:::ai
    MCP["MCP Protocol"]:::ai
    Twilio["Twilio<br/>(Voice/SMS/WA)"]:::infra
    Grammy["grammY<br/>(Telegram)"]:::infra
    Bolt["Bolt<br/>(Slack)"]:::infra
    OpenAI["OpenAI Realtime<br/>(Voice)"]:::ai
    Gemini["Gemini<br/>(Images)"]:::ai
    Zod["Zod<br/>(Validation)"]:::lang
    Pino["Pino<br/>(Logging)"]:::lang

    Bun --- TS --- Zod
    Bun --- PG
    TS --- Claude --- MCP
    Claude --- OpenAI
    Claude --- Gemini
    PG --- Twilio
    PG --- Grammy
    PG --- Bolt
    Pino --- Bun
```

</div>

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) >= 1.0 |
| **Language** | TypeScript (strict, ESNext) |
| **AI** | Claude Agent SDK, OpenAI Realtime, Gemini |
| **Protocol** | Model Context Protocol (MCP) |
| **Database** | PostgreSQL (via `postgres` driver) |
| **Channels** | grammY (Telegram), Bolt (Slack), Twilio (Voice/SMS/WhatsApp) |
| **Validation** | Zod v4 |
| **Logging** | Pino |
| **Images** | Sharp (processing), Gemini/OpenAI (generation) |

---

## Project Structure

```
heyclara/
├── bin/
│   └── clara                        # Shell wrapper (checks Bun, resolves paths)
├── src/
│   ├── cli/                         # Command routing
│   │   ├── index.ts                 # Entry point, subcommand dispatch
│   │   ├── job.ts                   # Job management (list, add, run, log)
│   │   ├── agent.ts                 # Agent inspection
│   │   ├── employee.ts              # Employee lifecycle
│   │   ├── channels.ts              # Channel control (send, off, on)
│   │   ├── phone.ts                 # Voice smoke-test
│   │   ├── self.ts                  # Persona commands (rules, memory)
│   │   ├── watch.ts                 # Slack watch management
│   │   ├── status.ts                # Status output
│   │   ├── active.ts                # Active engine detail
│   │   └── model.ts                 # Global model show/set
│   ├── core/                        # Daemon internals
│   │   ├── daemon.ts                # Lifecycle, startup guard, service-aware restart
│   │   ├── runner.ts                # Job execution (Claude SDK + Codex failover)
│   │   ├── agents.ts                # Agent scanner (project + user + shared dirs)
│   │   ├── scheduler.ts             # Due-time queries, cron/interval/once
│   │   ├── consolidator.ts          # Background memory extraction
│   │   ├── summarizer.ts            # Session summary generation
│   │   ├── finalizer.ts             # Unified post-session pipeline
│   │   └── alive.ts                 # Health heartbeat + self-recovery
│   ├── chat/                        # Conversation engine
│   │   ├── engine.ts                # Claude SDK query(), sessions, streaming
│   │   ├── identity.ts              # Persona + skill + agent prompt assembly
│   │   └── repl.ts                  # Terminal REPL interface
│   ├── channels/                    # Channel implementations
│   │   ├── telegram.ts              # Telegram (typing indicators, DM)
│   │   ├── slack.ts                 # Slack (threads, emoji, attachments)
│   │   ├── slack/                   # Slack submodules
│   │   │   ├── attachments.ts       # File handling (any MIME, 50MB)
│   │   │   └── watch.ts            # Proactive channel monitoring
│   │   ├── sms.ts                   # SMS (Twilio webhooks)
│   │   ├── whatsapp.ts             # WhatsApp (24h window)
│   │   ├── phone/                   # Voice channel
│   │   │   ├── index.ts            # Route registration
│   │   │   ├── twiml.ts            # TwiML XML builders
│   │   │   ├── relay.ts            # Twilio ↔ OpenAI Realtime bridge
│   │   │   ├── instructions.ts     # Voice system prompts
│   │   │   ├── tools.ts            # Mid-call tools (consult, send, save)
│   │   │   └── consult.ts          # Claude escape hatch for reasoning
│   │   ├── twilio/                  # Shared Twilio infrastructure
│   │   │   ├── server.ts           # Bun HTTP+WS + middleware
│   │   │   ├── signature.ts        # HMAC-SHA1 validation
│   │   │   ├── rest.ts             # placeCall, sendMessage, hangupCall
│   │   │   ├── dedup.ts            # TTL MessageSid/CallSid dedup
│   │   │   └── rate-limit.ts       # Sliding-window limiter (30/min)
│   │   └── common/
│   │       └── chat-session.ts      # Shared engine creation + room rotation
│   ├── commands/                    # CLI commands (non-daemon)
│   │   ├── init.ts                  # Interactive setup wizard
│   │   ├── service.ts              # OS service registration
│   │   ├── db.ts                   # Database setup
│   │   ├── backup.ts              # Config + DB backup with auto-prune
│   │   ├── validate.ts            # Config validation
│   │   ├── health.ts              # Health checks
│   │   └── health-db.ts           # DB-specific health check
│   ├── db/                          # Database layer
│   │   ├── connection.ts           # Lazy postgres, withDb() helper
│   │   ├── migrate.ts             # SQL migration runner
│   │   ├── migrations/            # Numbered .ts migration files
│   │   └── models/
│   │       ├── job.ts             # Job CRUD + pg_notify
│   │       ├── message.ts         # Chat message storage + room stats
│   │       ├── session.ts         # Session tracking
│   │       └── active_engine.ts   # Active engine registry
│   ├── mcp/                        # Tool server
│   │   ├── index.ts               # MCP factory (per-query instances)
│   │   ├── server.ts             # SDK MCP server creation
│   │   └── tools/
│   │       ├── table.ts           # Single declarative tool table
│   │       ├── jobs.ts            # Job management handlers
│   │       ├── send.ts            # Messaging handlers
│   │       ├── messages.ts        # History/search handlers
│   │       ├── watch.ts           # Watch channel handlers
│   │       └── misc.ts            # Memory, rules, agents, calls
│   ├── prompts/                    # System prompt templates
│   │   ├── index.ts              # Loader + interpolation
│   │   ├── environment.md        # Environment/config/memory template
│   │   ├── mode-chat.md          # Chat mode instructions
│   │   ├── mode-job.md           # Job mode instructions
│   │   ├── channel-slack.md      # Slack-specific rules
│   │   └── channel-telegram.md   # Telegram-specific rules
│   ├── types/                     # All type definitions
│   │   ├── index.ts              # Barrel export
│   │   ├── enums.ts             # JobStatus, ScheduleType, Mode, etc.
│   │   ├── config.ts            # Config interfaces
│   │   ├── job.ts               # JobInput, JobResult
│   │   ├── engine.ts            # ChatEngine, EngineOptions
│   │   └── channel.ts           # Channel, ChannelFactory
│   ├── constants/                 # Constant values
│   │   ├── index.ts             # DEFAULT_DATABASE_URL
│   │   └── attachment.ts        # Size limits, MIME types
│   └── utils/                    # Shared utilities
│       ├── config.ts            # Config loading, readRawConfig()
│       ├── paths.ts             # Path resolution from CLARA_HOME
│       ├── cli.ts               # CLI helpers, TTY colors
│       ├── errors.ts            # errMsg() helper
│       ├── log.ts               # Pino logger
│       ├── logger.ts            # JSONL audit + cron state
│       ├── time.ts              # Local timezone formatting
│       ├── duration.ts          # Duration string parsing
│       ├── pid.ts               # PID file management
│       ├── retry.ts             # withRetry() helper
│       └── attachment.ts        # MIME classification, image prep
├── agents/                       # Agent definitions
│   ├── marketer/AGENT.md        # Marketing specialist
│   └── senior-dev/AGENT.md     # Senior developer
├── skills/                      # 40+ modular skills
├── defaults/                    # Template files for clara init
│   ├── self/                   # identity, soul, owner, memory templates
│   └── channels/
│       └── slack-manifest.json # Slack app manifest with all scopes
├── tests/                       # Test suite (mirrors src/ structure)
├── docs/                        # Architecture diagrams
├── package.json
├── tsconfig.json
└── bun.lock
```

---

## CLI Reference

### Core Commands

```bash
clara init                          # Interactive setup wizard
clara start                         # Start background daemon (OS service)
clara stop                          # Stop daemon (waits for active engines)
clara restart                       # Service-aware restart
clara status                        # Daemon, jobs, channels, chat rooms
clara health                        # Full health check (DB, channels, API keys)
clara chat                          # Terminal REPL chat
clara chat --agent <name>           # Chat with specific agent persona
clara chat --employee <name>        # Chat as employee
clara run <prompt>                  # One-shot execution
clara update                        # Update to latest + restart daemon
```

### Job Management

```bash
clara job list                      # List all jobs with status and next run
clara job show <name>               # Job details + recent audit log
clara job add <name> <schedule> <prompt>  # Create a job
clara job update <name> [--schedule] [--prompt] [--model]
clara job run <name>                # Force trigger immediately
clara job log <name>                # View execution history
clara job archive <name>            # Hide from list, stop running
clara job unarchive <name>          # Restore to disabled state
```

### Employee Management

```bash
clara employee add                  # Create new AI co-founder
clara employee list                 # List all with role, project, status
clara employee show <name>          # Full details + memory
clara employee pause <name>         # Temporarily deactivate
clara employee resume <name>        # Reactivate
clara employee remove <name>        # Delete permanently
clara employee approvals            # Manage pending approvals
clara employee <name>               # Chat as employee (shorthand)
```

### Configuration

```bash
clara config list                   # View all config
clara config get <key>              # Get value (dot notation: channels.default)
clara config set <key> <value>      # Set value
clara model                         # Show current model
clara model <name>                  # Set global model (haiku, sonnet, opus)
clara channels off                  # Disable all channels (dev mode)
clara channels off telegram         # Disable one channel
clara channels on telegram          # Re-enable
```

### Persona

```bash
clara rules                         # Show current rules
clara rules reset                   # Reset to defaults
clara memory                        # Show permanent memory
clara memory reset                  # Clear all memory
```

---

## Configuration

All config lives in `~/.heyclara/config.yaml`:

```yaml
database_url: postgres://localhost:5432/heyclara
model: default                    # default | haiku | sonnet | opus
timezone: America/New_York
log_level: info
active_hours:
  start: "09:00"
  end: "23:00"
session_finalization:
  enabled: true
  memory_consolidation: true
  summaries: true
runner: claude                     # claude | codex
fallback:
  - codex                         # auto-failover on provider outage
channels:
  enabled: true
  default: telegram
  telegram:
    enabled: true
    bot_token: ...
    chat_id: ...
    open: false                   # true = anyone can chat
  slack:
    enabled: true
    bot_token: xoxb-...
    app_token: xapp-...
    dm_user_id: U06PBA2P680
    watch:                        # proactive channel monitoring
      "C123#general": {}
      "C456#alerts":
        behavior: security-watch
  twilio:
    sid: ...
    secret: ...
    auth_token: ...
  phone:
    enabled: true
    from_number: +1...
    port: 8080
    voice: alloy
    allowlist: ["+1..."]
  sms:
    enabled: true
    from_number: +1...
  whatsapp:
    enabled: true
    from_number: +1...
gemini_api_key: ...
openai_api_key: ...
```

Environment variables override config: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `PHONE_FROM_NUMBER`, `PUBLIC_BASE_URL`, and more.

---

## How Watch Channels Work

Watch channels let Clara proactively monitor Slack channels — receiving ALL messages (not just @mentions) and deciding autonomously whether to respond.

```mermaid
flowchart TD
    classDef watch fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef decision fill:#dbeafe,stroke:#2563eb,color:#1e3a5f
    classDef action fill:#dcfce7,stroke:#16a34a,color:#14532d

    Msg["Message in watched channel"]:::watch
    Load["Load behavior<br/>(file or inline)"]:::watch
    Inject["Inject behavior into<br/>system prompt"]:::decision
    Claude["Claude decides:<br/>respond or ignore?"]:::decision
    Reply["Reply in thread"]:::action
    Silent["[NO_REPLY] — stay silent"]:::action
    Hot["Config or behavior file<br/>changes on disk"]:::watch
    Reload["Hot-reload<br/>(mtime tracking)"]:::watch

    Msg --> Load --> Inject --> Claude
    Claude -->|relevant| Reply
    Claude -->|not relevant| Silent
    Hot --> Reload --> Load
```

Each watch lives in `~/.heyclara/watches/<name>/behavior.md`. Behaviors hot-reload without daemon restart.

---

## Development

```bash
# Install dependencies
bun install

# Run in foreground (dev mode)
bun run dev

# Type check
npm run typecheck

# Run full test suite (typecheck + cycle check + tests)
npm run test

# Run tests only
npm run test:bun

# Check for circular imports
npm run check:cycles
```

### Test Isolation

Tests set `CLARA_HOME` to a temp directory and call `resetConfig()` in cleanup. DB tests use a shared setup that auto-creates a `heyclara_test` database.

---

## Deployment

```bash
# Install as OS service (launchd on macOS, systemd on Linux)
clara start

# The daemon auto-registers itself. To manually manage:
clara stop --force              # Skip engine wait, force shutdown
clara restart --wait 5          # Wait up to 5 min for engines to clear
```

### Backup & Restore

```bash
clara backup                    # Creates timestamped backup (config + persona + pg_dump)
                                # Auto-prunes old backups
```

---

## Security

- **Twilio signature validation** — HMAC-SHA1 on every webhook
- **Rate limiting** — Sliding-window per-key (30 req/min default)
- **Message dedup** — TTL-based MessageSid/CallSid dedup (handles Twilio retries)
- **Credential isolation** — Sensitive env vars filtered before passing to Codex subprocess
- **Closed mode** — Telegram `open: false` restricts to configured `chat_id` only
- **Slack owner verification** — Messages prefixed with `[user:ID]` for reliable auth
- **Phone allowlist** — Only configured numbers can trigger inbound calls

---

## Contributing

**Don't add features. Add skills.**

Want Discord support? Don't create a PR that bloats the core. Instead, contribute a skill folder (`skills/add-discord/SKILL.md`) that teaches Clara how to add Discord herself. The core stays clean; capabilities grow organically.

```bash
# Create a new skill
mkdir skills/my-skill
cat > skills/my-skill/SKILL.md << 'EOF'
# My Skill

Description of what this skill does and when to use it.

## Steps
1. ...
2. ...
EOF
```

---

## Roadmap

- [x] Claude Agent SDK integration
- [x] Multi-channel (Telegram, Slack, Voice, SMS, WhatsApp)
- [x] Two-stage memory consolidation
- [x] Stateful job workspaces
- [x] Employee system (persistent AI co-founders)
- [x] Harness-agnostic backends (Claude + Codex failover)
- [x] Self-recovery (alive monitor + LLM agent)
- [x] 40+ skills
- [ ] Discord channel
- [ ] Web UI dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-user mode

---

## License

Released under the [MIT License](LICENSE).

Created by [Dev Chiniwala](https://devchiniwala.com).

---

<div align="center">
  <br/>
  <p><strong>Clara is small by design. Fork it. Mold it. Make it yours.</strong></p>
  <br/>
  <a href="https://github.com/DevChiniwala/HeyClara">
    <img src="https://img.shields.io/badge/Star_on_GitHub-171515?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://www.npmjs.com/package/@devchiniwala/heyclara">
    <img src="https://img.shields.io/badge/Install_from_npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
  </a>
</div>
