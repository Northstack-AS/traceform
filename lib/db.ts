import { sql } from "@vercel/postgres";

export { sql };

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      org_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL,
      api_key_hash TEXT NOT NULL UNIQUE,
      created_at BIGINT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS traces (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      input JSONB,
      output JSONB,
      started_at BIGINT NOT NULL,
      ended_at BIGINT,
      duration_ms INTEGER,
      metadata JSONB,
      tags TEXT[] DEFAULT '{}'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS spans (
      id TEXT PRIMARY KEY,
      trace_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      parent_span_id TEXT,
      type TEXT NOT NULL DEFAULT 'custom',
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ok',
      input JSONB,
      output JSONB,
      started_at BIGINT NOT NULL,
      ended_at BIGINT,
      duration_ms INTEGER,
      model TEXT,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      cost_usd DECIMAL(10,6),
      error TEXT,
      error_stack TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      span_id TEXT NOT NULL,
      trace_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      data JSONB
    )
  `;

  // Seed a demo project if none exists
  const existing = await sql`SELECT id FROM projects LIMIT 1`;
  if (existing.rows.length === 0) {
    const crypto = await import("crypto");
    const rawKey = "tf_demo_key_spike";
    const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
    await sql`
      INSERT INTO projects (id, name, api_key_hash, created_at)
      VALUES (gen_random_uuid()::text, 'Demo Project', ${hash}, ${Date.now()})
    `;
  }
}
