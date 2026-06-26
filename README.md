# HeyClara

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/runtime-Bun.js-ff69b4)](https://bun.sh)
[![AI](https://img.shields.io/badge/AI-Claude%20Agent%20SDK-8A2BE2)](https://github.com/anthropics/claude-agent-sdk)

> **Your personal AI assistant daemon.** Chat via Telegram or Slack, run scheduled jobs, manage a persona system with on-demand memory — all powered by a single well-prompted Claude agent with tools.

**CLI command:** `clara`
**npm package:** `heyclara`
**Config directory:** `~/.clara/`

---

## Philosophy

### Single-Agent System

HeyClara uses **one** agent (Clara) equipped with excellent tools. No multi-agent swarm, no complex orchestration — just a focused agent that knows when to use MCP tools and when to think. This keeps the system predictable, debuggable, and cost-effective.

### Atomic Tools (MCP)

**One tool = one side effect.** Tools return structured data; Clara decides what to do with it. Workflows are never hardcoded into the tools themselves — the agent composes them at runtime based on context.

### UI Parity

Whatever you can do through the CLI (`clara job add`, `clara config set`, etc.), Clara can achieve through its MCP tools. This means Clara can manage herself — she can add jobs, update config, check her own status, and save memories without you touching the terminal.

### Harness-Agnostic Backends

The system supports seamless provider-down failover. If Claude returns persistent 5xx errors, Clara automatically falls back to Codex (or any configured secondary backend) to complete the current task. No dropped messages, no stalled jobs.

### Fail Forward Error Handling

Errors are returned as structured data to the agent, never swallowed. Clara can inspect what went wrong, retry with a different approach, or explain the failure to you — she never silently crashes.

---

## Architecture

```
~/.clara/
├── config.yaml          # Database, channels, model, timezone, API keys
├── self/
│   ├── identity.md      # Agent personality and voice
│   ├── owner.md         # Who runs this agent
│   ├── soul.md          # How the agent works
│   ├── rules.md         # Behavioral instructions (loaded every session)
│   ├── memory.md        # Persistent facts and context (loaded every session)
│   └── staging.md       # Candidate memories awaiting review
├── jobs/                # Per-job prompt.md, working memory, state.md
├── images/
│   ├── profile.webp     # Profile picture for Telegram/Slack
│   └── reference.webp   # Visual identity reference
└── tmp/
    ├── clara.pid
    ├── daemon.log
    └── cron-state.json
```

### Data Flow

```
Telegram / Slack / Terminal
        │
        ▼
  ┌─────────────┐     ┌──────────┐     ┌────────────────┐
  │  CLI Entry   │────▶│  Daemon  │────▶│  Agent Runner  │
  │  (Commander) │     │  Loop    │     │  (failover)    │
  └─────────────┘     └──────────┘     └───────┬────────┘
        │                                       │
        ▼                                       ▼
  ┌─────────────┐                      ┌────────────────┐
  │  Channels   │                      │  Agent Backend  │
  │  (Telegram  │                      │  (Claude/Codex) │
  │   /Slack)   │                      └────────┬───────┘
  └─────────────┘                               │
        │                                       ▼
        ▼                               ┌────────────────┐
  ┌─────────────┐                       │  MCP Tools     │
  │  PostgreSQL │                       │  (in-process)  │
  │  (DB)       │                       └────────────────┘
  └─────────────┘
```

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime (≥ 1.0)
- PostgreSQL (14+)
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
# Install globally
npm i -g heyclara

# Run setup wizard
clara init

# Start the daemon
clara start
```

### Without npm (development)

```bash
# Clone and install
git clone https://github.com/DevChiniwala/HeyClara.git
cd HeyClara
bun install

# Run
bun start
```

---

## Commands

### Daemon
| Command | Description |
|---------|-------------|
| `clara start` | Start daemon + register OS service |
| `clara stop` | Stop daemon (guards active engines) |
| `clara restart` | Restart daemon |
| `clara status` | Show daemon, jobs, channels, chat rooms |
| `clara health` | Check daemon, DB, channels, config |
| `clara logs [-f]` | View daemon logs (follow with `-f`) |

### Chat
| Command | Description |
|---------|-------------|
| `clara chat` | Interactive terminal chat |
| `clara chat -c` | Continue last session |
| `clara run <prompt>` | One-shot prompt execution |
| `clara history [room]` | Recent messages |
| `clara send <msg>` | Send a message via default channel |

### Jobs
| Command | Description |
|---------|-------------|
| `clara job list` | List all scheduled jobs |
| `clara job add <name> <schedule> <prompt>` | Create a new job |
| `clara job show <name>` | Show job details + recent runs |
| `clara job update <name>` | Update job fields |
| `clara job remove <name>` | Delete a job |
| `clara job run <name>` | Execute a job immediately |
| `clara job enable/disable <name>` | Toggle job |

### Persona
| Command | Description |
|---------|-------------|
| `clara rules [show\|reset]` | View or reset rules.md |
| `clara memory [show\|reset]` | View or reset memory.md |
| `clara agent list` | List available agents |
| `clara skills [source]` | List available skills |

### Config
| Command | Description |
|---------|-------------|
| `clara config list` | Show all configuration |
| `clara config get <key>` | Get a config value (dot notation) |
| `clara config set <key> <value>` | Set a config value |
| `clara validate` | Validate config.yaml |

### System
| Command | Description |
|---------|-------------|
| `clara init` | Interactive setup wizard |
| `clara db setup` | Install + create database |
| `clara db migrate` | Run database migrations |
| `clara test` | Run tests |
| `clara version` | Show version |

---

## Configuration

HeyClara reads from `~/.clara/config.yaml` with environment variable overrides:

```yaml
model: default
runner: claude
fallback: [codex]
timezone: America/New_York
active_hours:
  start: "09:00"
  end: "02:00"     # Supports midnight-crossing windows
database_url: postgres://localhost:5432/clara
log_level: info

channels:
  enabled: true
  default: telegram
  telegram:
    enabled: true
    bot_token: ...          # Or TELEGRAM_BOT_TOKEN env
    chat_id: 123456789      # Or TELEGRAM_CHAT_ID env
  slack:
    enabled: true
    bot_token: ...          # Or SLACK_BOT_TOKEN env
    app_token: ...          # Or SLACK_APP_TOKEN env
    dm_user_id: ...         # Or SLACK_DM_USER_ID env

session_finalization:
  enabled: true
  memory_consolidation: true
  summaries: true
```

---

## What It Supports

- **Telegram** — Message Clara from your phone, typing indicator while processing
- **Slack** — Socket Mode bot with thread awareness, thinking emoji, watch channels for proactive monitoring
- **SMS (Twilio)** — Inbound/outbound text messaging
- **WhatsApp (Twilio)** — Rich messaging with Meta's 24-hour window compliance
- **Terminal chat** — REPL with session resume support
- **Scheduled jobs** — Cron, interval, and one-shot jobs with active hours and per-job model routing
- **Persona system** — Customizable identity, soul, owner profile, rules, and memory
- **Agents** — Domain specialists (marketer, senior-dev) via Claude subagents
- **Skills** — Extend Clara by adding skill directories with `SKILL.md` manifests
- **MCP tools** — 20+ tools for job management, messaging, memory, rules, and channel control
- **Background memory consolidation** — Automatic memory candidate extraction from conversations
- **Session summaries** — Optional handoff notes between sessions
- **Cross-platform service** — launchd (macOS), systemd (Linux)
- **Backup** — `clara backup` with pre-update auto-backup

---

## Skills

Skills are a directory-based extension system. Contributors create a folder with a `SKILL.md` that teaches Clara (or Claude Code) how to integrate new capabilities:

```
skills/add-discord/
├── SKILL.md           # What this skill does and how to install it
└── ...                # Templates, scripts, reference files
```

Users run the skill via Clara, and it transforms their installation with clean, purpose-built code — no feature bloat.

---

## Development

```bash
# Install dependencies
bun install

# Type-check
bun run typecheck

# Run tests
bun test

# Check for circular imports
bun run check:cycles
```

### Project Structure

```
src/
├── cli/           # Commander entry points
├── core/          # Daemon lifecycle, runner, scheduler
├── agent/         # Backend adapters (Claude, Codex)
├── db/            # PostgreSQL schema, migrations, models
├── channels/      # Telegram, Slack, Twilio integrations
├── mcp/           # MCP tool definitions and server
├── prompts/       # System prompt templates
├── types/         # TypeScript + Zod type definitions
└── utils/         # Config, logging, path resolution
```

---

## License

MIT

---

## Author

**Dev Chiniwala**
- GitHub: [@DevChiniwala](https://github.com/DevChiniwala)
