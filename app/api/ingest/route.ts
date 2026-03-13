import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function hashApiKey(key: string): Promise<string> {
  return createHash("sha256").update(key).digest("hex");
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const apiKeyHash = await hashApiKey(apiKey);
  const project = await convex.query(api.projects.getByApiKeyHash, { apiKeyHash });

  if (!project) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: { type: string; payload: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
  }

  const { type, payload } = body;

  if (!type || !payload) {
    return NextResponse.json({ error: "Missing type or payload" }, { status: 422 });
  }

  try {
    if (type === "trace") {
      await convex.mutation(api.traces.ingest, {
        projectId: project._id,
        name: payload.name as string,
        status: (payload.status as "running" | "success" | "error") ?? "running",
        input: payload.input,
        output: payload.output,
        startedAt: (payload.startedAt as number) ?? Date.now(),
        endedAt: payload.endedAt as number | undefined,
        durationMs: payload.durationMs as number | undefined,
        metadata: payload.metadata,
        tags: (payload.tags as string[]) ?? [],
      });
    } else if (type === "span") {
      await convex.mutation(api.spans.ingest, {
        traceId: payload.traceId as any,
        projectId: project._id,
        parentSpanId: payload.parentSpanId as string | undefined,
        type: (payload.type as "llm" | "tool" | "retrieval" | "custom") ?? "custom",
        name: payload.name as string,
        status: (payload.status as "ok" | "error") ?? "ok",
        input: payload.input,
        output: payload.output,
        startedAt: (payload.startedAt as number) ?? Date.now(),
        endedAt: payload.endedAt as number | undefined,
        durationMs: payload.durationMs as number | undefined,
        model: payload.model as string | undefined,
        promptTokens: payload.promptTokens as number | undefined,
        completionTokens: payload.completionTokens as number | undefined,
        costUsd: payload.costUsd as number | undefined,
        error: payload.error as string | undefined,
        errorStack: payload.errorStack as string | undefined,
      });
    } else if (type === "event") {
      await convex.mutation(api.events.ingest, {
        spanId: payload.spanId as string,
        traceId: payload.traceId as any,
        projectId: project._id,
        level: (payload.level as "debug" | "info" | "warn" | "error") ?? "info",
        message: payload.message as string,
        timestamp: (payload.timestamp as number) ?? Date.now(),
        data: payload.data,
      });
    } else {
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 422 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
