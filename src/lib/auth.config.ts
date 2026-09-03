import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config used by middleware.
 * Does not include providers that need Node.js runtime.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.endsWith("/login");
      const isOnRegisterPage = nextUrl.pathname.endsWith("/register");
      const isAuthPage = isOnLoginPage || isOnRegisterPage;

      // Protected routes (worker/employer dashboards)
      const isWorkerRoute = nextUrl.pathname.includes("/worker");
      const isEmployerRoute = nextUrl.pathname.includes("/employer");
      const isProtected = isWorkerRoute || isEmployerRoute;

      if (isProtected && !isLoggedIn) {
        // Redirect to login
        return false;
      }

      if (isAuthPage && isLoggedIn) {
        // Redirect logged-in users to their dashboard
        const role = (auth.user as { role?: string })?.role;
        const locale = nextUrl.pathname.split("/")[1] || "en";
        const dashboard =
          role === "EMPLOYER"
            ? `/${locale}/employer/dashboard`
            : `/${locale}/worker/dashboard`;
        return Response.redirect(new URL(dashboard, nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  providers: [],
};
