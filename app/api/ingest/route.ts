import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const { rows } = await sql`SELECT id FROM projects WHERE api_key_hash = ${keyHash} LIMIT 1`;
  if (rows.length === 0) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const projectId = rows[0].id;
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 422 }); }

  const { type, payload } = body;

  try {
    if (type === "trace") {
      await sql`
        INSERT INTO traces (id, project_id, name, status, input, output, started_at, ended_at, duration_ms, metadata, tags)
        VALUES (
          ${payload.traceId},
          ${projectId},
          ${payload.name},
          ${payload.status ?? "running"},
          ${JSON.stringify(payload.input ?? null)},
          ${JSON.stringify(payload.output ?? null)},
          ${payload.startedAt},
          ${payload.endedAt ?? null},
          ${payload.durationMs ?? null},
          ${JSON.stringify(payload.metadata ?? null)},
          ${payload.tags ?? []}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          output = EXCLUDED.output,
          ended_at = EXCLUDED.ended_at,
          duration_ms = EXCLUDED.duration_ms
      `;
    } else if (type === "span") {
      await sql`
        INSERT INTO spans (id, trace_id, project_id, parent_span_id, type, name, status, input, output, started_at, ended_at, duration_ms, model, prompt_tokens, completion_tokens, cost_usd, error, error_stack)
        VALUES (
          ${payload.spanId},
          ${payload.traceId},
          ${projectId},
          ${payload.parentSpanId ?? null},
          ${payload.type ?? "custom"},
          ${payload.name},
          ${payload.status ?? "ok"},
          ${JSON.stringify(payload.input ?? null)},
          ${JSON.stringify(payload.output ?? null)},
          ${payload.startedAt},
          ${payload.endedAt ?? null},
          ${payload.durationMs ?? null},
          ${payload.model ?? null},
          ${payload.promptTokens ?? null},
          ${payload.completionTokens ?? null},
          ${payload.costUsd ?? null},
          ${payload.error ?? null},
          ${payload.errorStack ?? null}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          output = EXCLUDED.output,
          ended_at = EXCLUDED.ended_at,
          duration_ms = EXCLUDED.duration_ms,
          prompt_tokens = EXCLUDED.prompt_tokens,
          completion_tokens = EXCLUDED.completion_tokens,
          cost_usd = EXCLUDED.cost_usd,
          error = EXCLUDED.error
      `;
    } else if (type === "event") {
      await sql`
        INSERT INTO events (id, span_id, trace_id, project_id, level, message, timestamp, data)
        VALUES (
          ${payload.eventId},
          ${payload.spanId},
          ${payload.traceId},
          ${projectId},
          ${payload.level ?? "info"},
          ${payload.message},
          ${payload.timestamp},
          ${JSON.stringify(payload.data ?? null)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 422 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (e: any) {
    console.error("Ingest error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
