# Traceform — AI Agent Observability

The black box for your AI agents. Trace every LLM call, tool use, and decision in your agent pipeline.

## Live Demo

[YOUR_VERCEL_URL]

## Stack

- **Next.js 15** (App Router, server components)
- **Vercel Postgres** (traces, spans, events storage)
- **TypeScript** · **Tailwind CSS**
- **traceform-js** SDK (zero-dependency)

## Quick Start

### 1. Run migrations

```bash
curl -X POST https://YOUR_VERCEL_URL/api/migrate
```

### 2. Instrument your agent

```typescript
import { Traceform } from "traceform-js";

const tf = new Traceform({
  baseUrl: "https://YOUR_VERCEL_URL",
  apiKey: "tf_demo_key_spike",
});

const trace = await tf.trace("my-agent-run", async (t) => {
  const span = await t.span("llm-call", { type: "llm" });
  // ... your agent logic
  await span.end({ status: "ok" });
});
```

### 3. View traces

Open `https://YOUR_VERCEL_URL/dashboard`

## API

### POST /api/ingest

Send traces, spans, and events.

**Headers:** `x-api-key: tf_demo_key_spike`

**Body:**
```json
{ "type": "trace", "payload": { "traceId": "...", "name": "...", ... } }
{ "type": "span",  "payload": { "spanId": "...", "traceId": "...", ... } }
{ "type": "event", "payload": { "eventId": "...", "traceId": "...", ... } }
```

### POST /api/migrate

Initialize database tables (idempotent, safe to re-run).

## Demo Project

The demo project API key is `tf_demo_key_spike`. This is seeded automatically on first migration.

## Local Development

```bash
pnpm install
# Set POSTGRES_URL in .env.local
pnpm dev
curl -X POST http://localhost:3000/api/migrate
```
