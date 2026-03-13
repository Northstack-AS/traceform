export type SpanType = "llm" | "tool" | "retrieval" | "custom";
export type SpanStatus = "ok" | "error";
export type TraceStatus = "running" | "success" | "error";
export type EventLevel = "debug" | "info" | "warn" | "error";

export interface TraceformOptions {
  apiKey: string;
  baseUrl?: string;
  onError?: (err: Error) => void;
}

export interface TraceOptions {
  input?: unknown;
  tags?: string[];
  metadata?: unknown;
}

export interface SpanOptions {
  type?: SpanType;
  input?: unknown;
  model?: string;
}

export interface EndTraceOptions {
  output?: unknown;
  status?: TraceStatus;
}

export interface EndSpanOptions {
  output?: unknown;
  status?: SpanStatus;
  model?: string;
  tokens?: {
    prompt?: number;
    completion?: number;
  };
  costUsd?: number;
  error?: string;
  errorStack?: string;
}

export interface IngestPayload {
  type: "trace" | "span" | "event";
  payload: Record<string, unknown>;
}
