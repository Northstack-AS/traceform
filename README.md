# Traceform

**The black box for your AI agents.**

Traceform is an open-source observability platform for AI agents. It captures every LLM call, tool invocation, and retrieval operation your agent makes — giving you a complete, real-time trace of what happened, why it happened, and how much it cost. Think of it as Datadog for AI agents: a structured waterfall of spans, events, and metadata that makes debugging and optimizing multi-step agents tractable.

## Quick Start

### 1. Install the SDK

```bash
npm install traceform-js
# or
pnpm add traceform-js
```

### 2. Instrument your agent

```typescript
import { Traceform } from "traceform-js";

const tf = new Traceform({
  apiKey: process.env.TRACEFORM_API_KEY!,
  baseUrl: "https://your-traceform.vercel.app", // or http://localhost:3000
});

async function runAgent(userQuery: string) {
  const trace = tf.trace("answer-question", {
    input: { query: userQuery },
    tags: ["production", "gpt-4o"],
  });

  const llmSpan = trace.span("openai-call", { type: "llm", input: { prompt: userQuery } });
  const result = await callOpenAI(userQuery);
  await llmSpan.end({
    output: result,
    model: "gpt-4o",
    tokens: { prompt: 150, completion: 80 },
    costUsd: 0.00023,
  });

  trace.log("info", "Agent completed", { resultLength: result.length });

  await trace.end({ output: result, status: "success" });
  return result;
}
```

### 3. View the dashboard

Navigate to `/dashboard` to see a real-time trace list. Click any trace to view the waterfall breakdown of spans, token usage, costs, and events.

## Self-Hosted Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/traceform
   cd traceform
   pnpm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   Copy the `NEXT_PUBLIC_CONVEX_URL` from the output.

3. **Set up Clerk**
   Create a Clerk application at clerk.com and copy your API keys.

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in:
   # NEXT_PUBLIC_CONVEX_URL=...
   # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   # CLERK_SECRET_KEY=...
   ```

5. **Create your first project**
   Use the Convex dashboard to insert a project record with a hashed API key.

6. **Run locally**
   ```bash
   pnpm dev
   ```

7. **Deploy**
   ```bash
   npx convex deploy
   vercel deploy
   ```

## Architecture

- **Ingest API** (`/api/ingest`): Authenticated HTTP endpoint. Accepts trace/span/event payloads, validates the API key against a SHA-256 hash stored in Convex, and writes to the database.
- **Convex**: Real-time database. The dashboard subscribes to trace updates via Convex's live queries — no polling required.
- **Clerk**: Auth for the dashboard UI.
- **SDK** (`traceform-js`): Thin TypeScript client. Fire-and-forget ingestion with error suppression — your agent never blocks on observability.

## Roadmap

- **Pricing model**: Free tier (10k spans/month), Pro ($29/mo for 1M spans), Enterprise
- **Python SDK**: `pip install traceform` — same API surface, same fire-and-forget semantics
- **ClickHouse migration**: Replace Convex with ClickHouse for analytical queries over billions of spans
- **Self-hosted Helm chart**: One-command Kubernetes deploy for enterprise air-gapped environments
- **Cost analytics**: Aggregate LLM spend by tag, model, project, time range
- **Alerting**: Slack/PagerDuty alerts on error rate spikes or cost anomalies
- **Session replay**: Reconstruct full agent conversations from raw traces
