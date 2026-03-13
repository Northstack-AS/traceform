import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("running"),
        v.literal("success"),
        v.literal("error")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("traces")
      .withIndex("by_projectId_startedAt", (q) =>
        q.eq("projectId", args.projectId)
      )
      .order("desc");

    const traces = await q.take(args.limit ?? 50);

    if (args.status) {
      return traces.filter((t) => t.status === args.status);
    }
    return traces;
  },
});

export const get = query({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.traceId);
  },
});

export const ingest = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("success"),
      v.literal("error")
    ),
    input: v.any(),
    output: v.optional(v.any()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    metadata: v.optional(v.any()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("traces", args);
  },
});

export const update = mutation({
  args: {
    traceId: v.id("traces"),
    status: v.optional(
      v.union(
        v.literal("running"),
        v.literal("success"),
        v.literal("error")
      )
    ),
    output: v.optional(v.any()),
    endedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { traceId, ...patch } = args;
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(traceId, filtered);
  },
});
