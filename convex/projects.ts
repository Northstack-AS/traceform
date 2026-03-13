import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByApiKeyHash = query({
  args: { apiKeyHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_apiKeyHash", (q) => q.eq("apiKeyHash", args.apiKeyHash))
      .unique();
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    apiKeyHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      orgId: args.orgId,
      name: args.name,
      apiKeyHash: args.apiKeyHash,
      createdAt: Date.now(),
    });
  },
});
