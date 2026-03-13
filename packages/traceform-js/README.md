# traceform-js

The official TypeScript SDK for [Traceform](https://traceform.dev) — AI agent observability.

Capture every trace, span, tool call, and token cost from your AI agents in two lines of code.

---

## Install

```bash
npm install traceform-js
# or
pnpm add traceform-js
# or
yarn add traceform-js
```

---

## Quickstart

Get your API key from [traceform.dev](https://traceform.dev) and add it to your environment:

```bash
TRACEFORM_API_KEY=tf_...
```

Then wrap your agent:

```typescript
import { Traceform } from 'traceform-js'

const tf = new Traceform({ apiKey: process.env.TRACEFORM_API_KEY! })

// Start a trace for one agent run
const trace = tf.trace('my-agent', { input: userQuery })

// Wrap an LLM call
const llmSpan = trace.span('openai.chat', { type: 'llm', input: messages })
const response = await openai.chat.completions.create({ model: 'gpt-4o', messages })
await llmSpan.end({
  output: response.choices[0].message,
  model: 'gpt-4o',
  tokens: { prompt: response.usage.prompt_tokens, completion: response.usage.completion_tokens },
  costUsd: 0.005,
})

// Wrap a tool call
const toolSpan = trace.span('search_web', { type: 'tool', input: { query } })
const results = await searchWeb(query)
await toolSpan.end({ output: results })

// Log anything
trace.log('info', 'Retrying after rate limit', { attempt: 2 })

// End the trace
await trace.end({ output: finalAnswer, status: 'success' })
```

Open your dashboard — you'll see the trace with a full waterfall, token breakdown, and costs.

---

## Core concepts

### Trace

A trace is one complete agent run — from user input to final output.

```typescript
const trace = tf.trace(name, options?)
```

| Option | Type | Description |
|--------|------|-------------|
| `input` | `any` | The input to this run (user query, task, etc.) |
| `tags` | `string[]` | Tag this trace for filtering (e.g. `['prod', 'gpt-4o']`) |
| `metadata` | `object` | Any extra key-value data |

### Span

A span is one step inside a trace — an LLM call, tool call, retrieval, or anything else.

```typescript
const span = trace.span(name, options?)
```

| Option | Type | Description |
|--------|------|-------------|
| `type` | `'llm' \| 'tool' \| 'retrieval' \| 'custom'` | Step type (affects dashboard coloring) |
| `input` | `any` | Input to this step |

End a span when the step completes:

```typescript
await span.end({
  output,         // What this step returned
  status,         // 'ok' (default) or 'error'
  model,          // e.g. 'gpt-4o' (for LLM spans)
  tokens,         // { prompt: number, completion: number }
  costUsd,        // Cost in USD
  error,          // Error message if status is 'error'
})
```

### Events

Log anything to a trace — warnings, retries, debug info:

```typescript
trace.log('info', 'Starting web search', { query })
trace.log('warn', 'Rate limit hit, retrying', { attempt: 2 })
trace.log('error', 'Tool call failed', { error: e.message })

// Or attach to a specific span
span.log('debug', 'Cache miss', { key })
```

Levels: `debug` · `info` · `warn` · `error`

---

## Framework examples

### Vercel AI SDK

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Traceform } from 'traceform-js'

const tf = new Traceform({ apiKey: process.env.TRACEFORM_API_KEY! })

async function runAgent(userQuery: string) {
  const trace = tf.trace('vercel-ai-agent', { input: userQuery })

  const llmSpan = trace.span('generate-text', { type: 'llm' })
  const { text, usage } = await generateText({
    model: openai('gpt-4o'),
    prompt: userQuery,
  })
  await llmSpan.end({
    output: text,
    model: 'gpt-4o',
    tokens: { prompt: usage.promptTokens, completion: usage.completionTokens },
  })

  await trace.end({ output: text, status: 'success' })
  return text
}
```

### LangChain

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { Traceform } from 'traceform-js'

const tf = new Traceform({ apiKey: process.env.TRACEFORM_API_KEY! })

async function runChain(userQuery: string) {
  const trace = tf.trace('langchain-agent', { input: userQuery, tags: ['langchain'] })

  const llmSpan = trace.span('chat-openai', { type: 'llm', input: userQuery })
  const llm = new ChatOpenAI({ model: 'gpt-4o' })
  const response = await llm.invoke(userQuery)
  await llmSpan.end({ output: response.content })

  await trace.end({ output: response.content, status: 'success' })
  return response.content
}
```

### Raw OpenAI

```typescript
import OpenAI from 'openai'
import { Traceform } from 'traceform-js'

const openai = new OpenAI()
const tf = new Traceform({ apiKey: process.env.TRACEFORM_API_KEY! })

async function runAgent(messages: any[], userQuery: string) {
  const trace = tf.trace('openai-agent', { input: userQuery })

  const span = trace.span('openai.chat', { type: 'llm', input: messages })
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  })
  await span.end({
    output: res.choices[0].message,
    model: res.model,
    tokens: {
      prompt: res.usage?.prompt_tokens ?? 0,
      completion: res.usage?.completion_tokens ?? 0,
    },
  })

  await trace.end({ output: res.choices[0].message.content, status: 'success' })
}
```

---

## Error handling

The SDK is fail-safe by design. Ingest failures never crash your agent.

```typescript
// Errors are swallowed by default. Opt into logging:
const tf = new Traceform({
  apiKey: process.env.TRACEFORM_API_KEY!,
  onError: (err) => console.error('[traceform]', err.message),
})
```

To capture agent errors in the trace:

```typescript
const trace = tf.trace('my-agent', { input: query })
try {
  // ... agent logic
  await trace.end({ output: result, status: 'success' })
} catch (err: any) {
  trace.log('error', err.message, { stack: err.stack })
  await trace.end({ status: 'error' })
  throw err
}
```

---

## Configuration

```typescript
new Traceform({
  apiKey: string,           // Required. Your project API key.
  baseUrl?: string,         // Default: https://traceform.dev. Override for self-hosted.
  onError?: (e: Error) => void,  // Optional error handler. Defaults to silent.
})
```

---

## TypeScript

Full types exported:

```typescript
import type {
  TraceformOptions,
  TraceOptions,
  SpanOptions,
  EndTraceOptions,
  EndSpanOptions,
  SpanType,
  EventLevel,
} from 'traceform-js'
```

---

## Self-hosted

Traceform will support self-hosted deployments. Point the SDK at your own instance:

```typescript
const tf = new Traceform({
  apiKey: 'your-key',
  baseUrl: 'https://traces.yourcompany.com',
})
```

---

## License

MIT · Built by [Northstack](https://northstack.one)
