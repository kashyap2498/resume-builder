import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/webhooks/lemonsqueezy",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();

    // Verify signature
    const signature = request.headers.get("X-Signature");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    );
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSignature !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(body);
    const eventName = payload.meta?.event_name;

    // Only process order_created events
    if (eventName !== "order_created") {
      return new Response("OK", { status: 200 });
    }

    // Extract data
    const userId = payload.meta?.custom_data?.user_id;
    if (!userId) {
      console.error("No user_id in webhook custom_data");
      return new Response("Missing user_id", { status: 400 });
    }

    const orderId = String(payload.data?.id);
    const variantId = String(
      payload.data?.attributes?.first_order_item?.variant_id
    );
    const customerEmail = payload.data?.attributes?.user_email;

    // Determine plan from variant ID
    const monthlyVariant = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
    const lifetimeVariant = process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID;

    let plan: "monthly" | "lifetime";
    if (variantId === lifetimeVariant) {
      plan = "lifetime";
    } else if (variantId === monthlyVariant) {
      plan = "monthly";
    } else {
      console.error("Unknown variant ID:", variantId);
      return new Response("Unknown variant", { status: 400 });
    }

    // Record purchase
    await ctx.runMutation(internal.purchases.recordPurchase, {
      userId: userId as any,
      lemonSqueezyOrderId: orderId,
      variantId,
      plan,
      customerEmail,
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
