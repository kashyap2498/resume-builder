import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const ResendOTPForVerification = Resend({
  from: "Resumello <noreply@resumello.app>",
  apiKey: process.env.RESEND_API_KEY,
  async sendVerificationRequest({ identifier: email, token, provider }) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: provider.from,
        to: email,
        subject: "Verify your Resumello account",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 0;">
            <h2 style="color: #111; font-size: 20px; margin-bottom: 8px;">Verify your email</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">
              Enter this code to verify your Resumello account:
            </p>
            <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">${token}</span>
            </div>
            <p style="color: #999; font-size: 12px;">
              If you didn't create a Resumello account, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to send verification email");
    }
  },
});

const ResendOTPForReset = Resend({
  from: "Resumello <noreply@resumello.app>",
  apiKey: process.env.RESEND_API_KEY,
  async sendVerificationRequest({ identifier: email, token, provider }) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: provider.from,
        to: email,
        subject: "Reset your Resumello password",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 0;">
            <h2 style="color: #111; font-size: 20px; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">
              Enter this code to reset your Resumello password:
            </p>
            <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">${token}</span>
            </div>
            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to send reset email");
    }
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      verify: ResendOTPForVerification,
      reset: ResendOTPForReset,
    }),
    Google,
  ],
});
