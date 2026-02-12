import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  resumes: defineTable({
    userId: v.id("users"),
    data: v.string(),
    name: v.string(),
    templateId: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),
  purchases: defineTable({
    userId: v.id("users"),
    lemonSqueezyOrderId: v.string(),
    variantId: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("lifetime")),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("refunded")),
    purchasedAt: v.string(),
    expiresAt: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_order", ["lemonSqueezyOrderId"]),
});
