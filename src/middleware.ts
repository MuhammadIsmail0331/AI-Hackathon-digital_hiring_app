import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Run next-intl middleware for locale routing
  const intlResponse = intlMiddleware(req);

  // Auth protection
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  // Protected routes
  const isWorkerRoute = pathname.includes("/worker");
  const isEmployerRoute = pathname.includes("/employer");
  const isProtected = isWorkerRoute || isEmployerRoute;

  if (isProtected && !isLoggedIn) {
    const locale = pathname.split("/")[1] || "en";
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // Auth pages - redirect logged-in users away
  const isLoginPage = pathname.endsWith("/login");
  const isRegisterPage = pathname.endsWith("/register");
  const isAuthPage = isLoginPage || isRegisterPage;

  if (isAuthPage && isLoggedIn) {
    const role = (req.auth?.user as { role?: string })?.role;
    const locale = pathname.split("/")[1] || "en";
    const dashboard =
      role === "EMPLOYER"
        ? `/${locale}/employer/dashboard`
        : `/${locale}/worker/dashboard`;
    return Response.redirect(new URL(dashboard, req.nextUrl.origin));
  }

  return intlResponse;
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
