import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { auth } from "./auth";

export const getActivePurchase = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const activePurchases = await ctx.db
      .query("purchases")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    if (activePurchases.length === 0) return null;

    // Prefer lifetime over monthly
    const lifetime = activePurchases.find((p) => p.plan === "lifetime");
    if (lifetime) return lifetime;

    // For monthly, check expiry
    const now = new Date().toISOString();
    const activeMonthly = activePurchases.find(
      (p) => p.plan === "monthly" && p.expiresAt && p.expiresAt > now
    );
    return activeMonthly ?? null;
  },
});

export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    return userId ?? null;
  },
});

export const recordPurchase = internalMutation({
  args: {
    userId: v.id("users"),
    lemonSqueezyOrderId: v.string(),
    variantId: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("lifetime")),
    customerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check if order already recorded
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_order", (q) =>
        q.eq("lemonSqueezyOrderId", args.lemonSqueezyOrderId)
      )
      .first();

    if (existing) return existing._id;

    const now = new Date();
    const expiresAt =
      args.plan === "monthly"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    return await ctx.db.insert("purchases", {
      userId: args.userId,
      lemonSqueezyOrderId: args.lemonSqueezyOrderId,
      variantId: args.variantId,
      plan: args.plan,
      status: "active",
      purchasedAt: now.toISOString(),
      expiresAt,
      customerEmail: args.customerEmail,
    });
  },
});
