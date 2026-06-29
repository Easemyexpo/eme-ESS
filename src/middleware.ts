import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe auth (no DB providers) — only checks the session cookie/JWT.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
