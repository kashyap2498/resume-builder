import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      verify: Resend({
        from: "Resumello <noreply@resumello.app>",
        apiKey: process.env.RESEND_API_KEY,
      }),
      reset: Resend({
        from: "Resumello <noreply@resumello.app>",
        apiKey: process.env.RESEND_API_KEY,
      }),
    }),
    Google,
  ],
});
