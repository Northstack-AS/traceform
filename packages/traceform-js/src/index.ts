import {
  TraceformOptions,
  TraceOptions,
  SpanOptions,
  EndTraceOptions,
  EndSpanOptions,
  EventLevel,
  SpanType,
} from "./types";

export * from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class Span {
  readonly id: string;
  private _name: string;
  private _startedAt: number;
  private _traceId: string;
  private _projectContext: { apiKey: string; baseUrl: string; onError?: (e: Error) => void };
  private _type: SpanType;
  private _input?: unknown;
  private _events: Array<{ level: EventLevel; message: string; timestamp: number; data?: unknown }> = [];

  constructor(
    name: string,
    traceId: string,
    projectContext: { apiKey: string; baseUrl: string; onError?: (e: Error) => void },
    opts?: SpanOptions
  ) {
    this.id = generateId();
    this._name = name;
    this._traceId = traceId;
    this._projectContext = projectContext;
    this._startedAt = Date.now();
    this._type = opts?.type ?? "custom";
    this._input = opts?.input;
  }

  log(level: EventLevel, message: string, data?: unknown): void {
    this._events.push({ level, message, timestamp: Date.now(), data });
    this._fireEvent(level, message, data);
  }

  private _fireEvent(level: EventLevel, message: string, data?: unknown): void {
    this._send({
      type: "event",
      payload: {
        spanId: this.id,
        traceId: this._traceId,
        level,
        message,
        timestamp: Date.now(),
        data,
      },
    });
  }

  async end(opts?: EndSpanOptions): Promise<void> {
    const endedAt = Date.now();
    const durationMs = endedAt - this._startedAt;
    await this._send({
      type: "span",
      payload: {
        spanId: this.id,
        traceId: this._traceId,
        type: this._type,
        name: this._name,
        status: opts?.status ?? "ok",
        input: this._input,
        output: opts?.output,
        startedAt: this._startedAt,
        endedAt,
        durationMs,
        model: opts?.model,
        promptTokens: opts?.tokens?.prompt,
        completionTokens: opts?.tokens?.completion,
        costUsd: opts?.costUsd,
        error: opts?.error,
        errorStack: opts?.errorStack,
      },
    });
  }

  private _send(payload: { type: string; payload: Record<string, unknown> }): void {
    const { apiKey, baseUrl, onError } = this._projectContext;
    fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    });
  }
}

class Trace {
  readonly id: string;
  private _name: string;
  private _startedAt: number;
  private _projectContext: { apiKey: string; baseUrl: string; onError?: (e: Error) => void };
  private _input?: unknown;
  private _tags: string[];
  private _metadata?: unknown;
  private _flushed = false;

  constructor(
    name: string,
    projectContext: { apiKey: string; baseUrl: string; onError?: (e: Error) => void },
    opts?: TraceOptions
  ) {
    this.id = generateId();
    this._name = name;
    this._projectContext = projectContext;
    this._startedAt = Date.now();
    this._input = opts?.input;
    this._tags = opts?.tags ?? [];
    this._metadata = opts?.metadata;

    // Fire-and-forget: register trace as running
    this._send({
      type: "trace",
      payload: {
        traceId: this.id,
        name: this._name,
        status: "running",
        input: this._input,
        startedAt: this._startedAt,
        tags: this._tags,
        metadata: this._metadata,
      },
    });
  }

  span(name: string, opts?: SpanOptions): Span {
    return new Span(name, this.id, this._projectContext, opts);
  }

  log(level: EventLevel, message: string, data?: unknown): void {
    this._send({
      type: "event",
      payload: {
        spanId: this.id,
        traceId: this.id,
        level,
        message,
        timestamp: Date.now(),
        data,
      },
    });
  }

  async end(opts?: EndTraceOptions): Promise<void> {
    if (this._flushed) return;
    this._flushed = true;

    const endedAt = Date.now();
    const durationMs = endedAt - this._startedAt;

    await this._send({
      type: "trace",
      payload: {
        traceId: this.id,
        name: this._name,
        status: opts?.status ?? "success",
        input: this._input,
        output: opts?.output,
        startedAt: this._startedAt,
        endedAt,
        durationMs,
        tags: this._tags,
        metadata: this._metadata,
      },
    });
  }

  private _send(payload: { type: string; payload: Record<string, unknown> }): void {
    const { apiKey, baseUrl, onError } = this._projectContext;
    fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    });
  }
}

export class Traceform {
  private _context: { apiKey: string; baseUrl: string; onError?: (e: Error) => void };

  constructor(opts: TraceformOptions) {
    this._context = {
      apiKey: opts.apiKey,
      baseUrl: opts.baseUrl?.replace(/\/$/, "") ?? "https://traceform.io",
      onError: opts.onError,
    };
  }

  trace(name: string, opts?: TraceOptions): Trace {
    return new Trace(name, this._context, opts);
  }
}

export default Traceform;
