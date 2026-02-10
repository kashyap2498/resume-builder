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
});
