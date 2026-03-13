import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    orgId: v.string(),
    name: v.string(),
    apiKeyHash: v.string(),
    createdAt: v.number(),
  }).index("by_apiKeyHash", ["apiKeyHash"]),

  traces: defineTable({
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
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_startedAt", ["projectId", "startedAt"]),

  spans: defineTable({
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
  })
    .index("by_traceId", ["traceId"])
    .index("by_projectId", ["projectId"]),

  events: defineTable({
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
  })
    .index("by_traceId", ["traceId"])
    .index("by_spanId", ["spanId"]),
});
