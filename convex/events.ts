import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByTrace = query({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_traceId", (q) => q.eq("traceId", args.traceId))
      .order("asc")
      .collect();
  },
});

export const ingest = mutation({
  args: {
    spanId: v.string(),
    traceId: v.id("traces"),
    projectId: v.id("projects"),
    level: v.union(
      v.literal("debug"),
      v.literal("info"),
      v.literal("warn"),
      v.literal("error")
    ),
    message: v.string(),
    timestamp: v.number(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});
