import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe portion of the auth configuration. It contains no database or
 * Node-only code so it can run inside the middleware (Edge runtime). The
 * Credentials provider — which needs Mongoose + bcrypt — is added separately in
 * `auth.ts`, which only runs in the Node runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // populated in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Everything else under the app requires a session.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.empId = user.empId;
        token.role = user.role;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.empId = token.empId;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
