import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db";

export async function POST() {
  try {
    await runMigrations();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
