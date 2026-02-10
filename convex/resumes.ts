import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const normalizedId = ctx.db.normalizeId("resumes", id);
    if (!normalizedId) return null;
    const resume = await ctx.db.get(normalizedId);
    if (!resume || resume.userId !== userId) return null;
    return resume;
  },
});

export const create = mutation({
  args: {
    data: v.string(),
    name: v.string(),
    templateId: v.string(),
  },
  handler: async (ctx, { data, name, templateId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("resumes", {
      userId,
      data,
      name,
      templateId,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const save = mutation({
  args: {
    id: v.id("resumes"),
    data: v.string(),
    name: v.optional(v.string()),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, { id, data, name, templateId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, {
      data,
      updatedAt: new Date().toISOString(),
      ...(name !== undefined && { name }),
      ...(templateId !== undefined && { templateId }),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, { id }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, { id }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    return await ctx.db.insert("resumes", {
      userId,
      data: existing.data,
      name: `${existing.name} (Copy)`,
      templateId: existing.templateId,
      updatedAt: new Date().toISOString(),
    });
  },
});
