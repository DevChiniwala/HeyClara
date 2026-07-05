# clara

[![npm version](https://img.shields.io/npm/v/@devchiniwala/heyclara.svg)](https://www.npmjs.com/package/@devchiniwala/heyclara)
[![npm downloads](https://img.shields.io/npm/dm/@devchiniwala/heyclara.svg)](https://www.npmjs.com/package/@devchiniwala/heyclara)
[![license](https://img.shields.io/npm/l/@devchiniwala/heyclara.svg)](https://github.com/DevChiniwala/HeyClara/blob/main/LICENSE)

A personal AI agent you fork and make your own. Small enough to understand, built for one user. Powered by Claude Agent SDK.

- npm package: [`heyclara`](https://www.npmjs.com/package/@devchiniwala/heyclara)
- CLI command: `clara`
- Website: [heyclara.com](https://heyclara.com)

## Philosophy

**Small enough to understand.** One process, a few source files. No microservices, no message queues, no abstraction layers. Have Claude Code walk you through it.

**Built for one user.** This isn't a framework. It's working software that fits your exact needs. You fork it and have Claude Code make it match your exact needs.

**Customization = code changes.** No configuration sprawl. Want different behavior? Modify the code. The codebase is small enough that this is safe.

**AI-native.** No installation wizard; Claude Code guides setup. No monitoring dashboard; ask Claude what's happening. No debugging tools; describe the problem, Claude fixes it.

**Skills over features.** Contributors shouldn't add features to the codebase. Instead, they contribute claude code skills like `/add-discord` that transform your fork. You end up with clean code that does exactly what you need.

**Best harness, best model.** This runs on Claude Agent SDK, which means you're running Claude Code directly. The harness matters. A bad harness makes even smart models seem dumb, a good harness gives them superpowers.

## Quick Start

```bash
npm i -g @devchiniwala/heyclara        # installs globally (prompts to install Bun if missing)
clara init                # guided setup (database, channels, persona, visual identity)
clara start               # starts daemon + registers OS service
```

## What It Supports

- **Telegram** — message your agent from your phone, typing indicator while processing
- **Slack** — Socket Mode bot with thread awareness, thinking emoji, watch channels for proactive monitoring
- **Phone (voice)** — Twilio + OpenAI Realtime. Inbound calls from allowlisted contacts and outbound calls via `place_call` MCP tool. Scheduled jobs can dial you (morning standup, evening retro, escalation). See `/clara-phone` skill.
- **SMS** — Twilio Messaging on the same number. Inbound webhook → chat engine → REST reply. Reachability fallback when data is unavailable but cellular works (treks, basements, patchy zones).
- **WhatsApp** — Twilio Sandbox by default (production WABA when policy permits). Rich messaging with `whatsapp:` prefix. Enforces Meta's 24-hour customer-service window.
- **Terminal chat** — REPL with session resume support
- **Scheduled jobs** — recurring jobs and crons that run Claude and can message you back. Stateful by default (working memory), per-job model routing for cost savings
- **Persona system** — customizable identity, soul, owner profile, rules, and memory (preloaded every session)
- **Agents** — domain specialists (marketer, senior-dev) via Claude Agent SDK subagents
- **Skills** — loads skills from multiple directories, invokable as slash commands
- **Cross-platform service** — launchd (macOS), systemd (Linux), service-aware restart
- **MCP tools** — 21 tools for job management, messaging, memory, rules, channel control, and outbound phone calls
- **Background memory consolidation** — stages memory candidates from conversations automatically
- **Session summaries** — optional handoff notes between sessions for continuity
- **Backups** — `clara backup` with auto-backup before updates
- **Optional integrations** — add Gmail, Discord, and more via skills

## Commands

```
clara init                       — interactive setup (db, channels, persona, agents, active hours)
clara start / stop               — daemon + OS service (launchd/systemd)
clara restart                    — restart daemon (service-aware)
clara status                     — show daemon, jobs, channels, chat rooms
clara active [--full]            — show active engine count or details
clara model [name]               — show or set global Claude model
clara health                     — check daemon, db, channels, config
clara chat [-c|-r] [--channel ch] — terminal chat (new by default, -c continue, -r pick)
clara run <prompt>               — one-shot prompt execution
clara history [room]             — recent messages
clara logs [-f] [--channel ch]   — daemon logs (follow with -f, filter by channel)
clara send [-c channel] <msg>    — send a message via channel
clara version                    — show version
clara update                     — update to latest version (auto-backup + restart)

clara job list                   — list all jobs
clara job show [name]            — full details + recent runs
clara job status [name]          — quick status check
clara job add <n> <s> <p>        — add a job (--type, --always, --agent, --model, --stateless, --prompt-file)
clara job update <name>          — update a job (--schedule, --prompt, --prompt-file, --type, --always, --agent, --model, --stateless)
clara job remove <name>          — delete a job
clara job enable / disable <n>   — toggle a job
clara job run <name>             — run a job once
clara job log [name]             — show recent run history

clara rules [show|reset]         — view or reset rules.md
clara memory [show|reset]        — view or reset memory.md
clara agent list                 — list available agents
clara agent show <name>          — show agent details and prompt
clara skills [source]            — list available skills

clara channels                   — show channel status (on/off)
clara channels on / off          — enable/disable all channels (applied via SIGHUP, no restart)
clara channels off telegram      — disable one channel without removing its token
clara watch list                 — list Slack watch channels
clara watch add/remove/enable/disable — manage watch channels

clara config list                — show all config
clara config get <key>           — get a config value (dot notation supported)
clara config set <key> <value>   — set a config value
clara validate                   — validate config.yaml
clara backup [list]              — create or list backups
clara test [-v]                  — run tests

clara db setup                   — install PostgreSQL + create database + migrate
clara db migrate                 — run database migrations
clara db status                  — check database connection
```

## Architecture

All config and data lives in `~/.heyclara/`:

```
~/.heyclara/
  config.yaml       — database, channels, model, timezone, active hours, API keys
  self/
    identity.md     — agent personality and voice
    owner.md        — who runs this agent
    soul.md         — how the agent works
    rules.md        — behavioral instructions (loaded every session)
    memory.md       — persistent facts and context (loaded every session)
  jobs/               — per-job prompt.md, working memory, and state (auto-created)
  optimizations/      — optimization loop run workspaces
  images/
    reference.webp  — visual identity reference image
    profile.webp    — profile picture for Telegram/Slack
  tmp/
    clara.pid, daemon.log, cron-state.json, cron-audit.jsonl
```

Post-session background LLM work can be disabled in `config.yaml`:

```yaml
session_finalization:
  enabled: true
  memory_consolidation: true
  summaries: true
```

Use `clara config set session_finalization.memory_consolidation false` to stop memory staging, `clara config set session_finalization.summaries false` to stop session summaries, or `clara config set session_finalization.enabled false` to disable both.

## Contributing

**Don't add features. Add skills.**

If you want to add Discord support, don't create a PR that adds Discord alongside Telegram. Instead, contribute a skill folder (`skills/add-discord/SKILL.md`) that teaches Claude Code how to transform a clara installation to use Discord.

Users then run `/add-discord` on their fork and get clean code that does exactly what they need, not a bloated system trying to support every use case.

## Requirements

- [Bun](https://bun.sh) runtime (auto-installed if missing)
- PostgreSQL (`clara db setup` handles installation)
- Claude API access (via `@anthropic-ai/claude-agent-sdk`)
- Gemini API key (optional, for image generation — `clara config set gemini_api_key ...`)
- OpenAI API key (optional, for image generation — `clara config set openai_api_key ...`)

## Updating

```bash
clara update               # auto-backup, install latest, restart daemon
```

## Author

Aman ([amankumar.ai](https://amankumar.ai))
