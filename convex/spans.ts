import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByTrace = query({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("spans")
      .withIndex("by_traceId", (q) => q.eq("traceId", args.traceId))
      .order("asc")
      .collect();
  },
});

export const ingest = mutation({
  args: {
    traceId: v.id("traces"),
    projectId: v.id("projects"),
    parentSpanId: v.optional(v.string()),
    type: v.union(
      v.literal("llm"),
      v.literal("tool"),
      v.literal("retrieval"),
      v.literal("custom")
    ),
    name: v.string(),
    status: v.union(v.literal("ok"), v.literal("error")),
    input: v.optional(v.any()),
    output: v.optional(v.any()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    model: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    error: v.optional(v.string()),
    errorStack: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("spans", args);
  },
});
