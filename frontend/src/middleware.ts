import createI18nMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

// Create i18n middleware
const i18nMiddleware = createI18nMiddleware(routing);

// Constants
const SUPPORTED_LOCALES = ["en", "fr"];
const ALLOWED_PATHS = [
  "/dashboard", // Only exact dashboard page, not sub-routes
  "/maintenance",
  "/login",
  "/login/2fa",
  "/signup",
];
const PUBLIC_PATHS = [
  "/maintenance",
  "/login",
  "/login/2fa", 
  "/signup",
];

const verifyToken = async (token: string) => {
  try {
    // For mock authentication, accept any mock token
    if (token === 'mock-jwt-token-admin-user') {
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Middleware] Token verification error:', error);
    return false;
  }
};

const redirectTo = (request: NextRequest, path: string) => {
  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
};

export async function middleware(request: NextRequest) {
  console.log(
    `[Middleware] Processing request for: ${request.nextUrl.pathname}`
  );

  // Handle i18n
  const i18nResponse = i18nMiddleware(request);

  // Parse path and locale
  const pathParts = request.nextUrl.pathname.split("/").filter(Boolean);
  const [possibleLocale, ...segments] = pathParts;
  const locale = SUPPORTED_LOCALES.includes(possibleLocale)
    ? possibleLocale
    : "";
  const actualSegments = locale ? segments : [possibleLocale, ...segments].filter(Boolean);

  console.log(`[Middleware] Locale: ${locale}, Segments:`, actualSegments);

  // Build the actual path without locale
  const actualPath = "/" + actualSegments.join("/");
  
  // Check if the path is allowed
  const isAllowedPath = ALLOWED_PATHS.some((allowedPath) => {
    if (allowedPath === "/dashboard") {
      // For dashboard, only allow exact match, no sub-routes
      return actualPath === allowedPath;
    }
    // For other paths, allow sub-routes
    return actualPath === allowedPath || actualPath.startsWith(allowedPath + "/");
  });

  const isPublicPath = PUBLIC_PATHS.some((path) => {
    // Allow sub-routes for all public paths (login, maintenance, etc.)
    return actualPath === path || actualPath.startsWith(path + "/");
  });

  // Redirect root path to login
  if (actualSegments.length === 0) {
    console.log("[Middleware] Root path accessed, redirecting to login");
    return redirectTo(request, "/login");
  }

  console.log(`[Middleware] Actual path: ${actualPath}, Is allowed: ${isAllowedPath}, Is public: ${isPublicPath}`);

  // If path is not allowed, redirect to maintenance
  if (!isAllowedPath) {
    console.log("[Middleware] Path not allowed, redirecting to maintenance");
    return redirectTo(request, "/maintenance");
  }

  const token = request.cookies.get("access_token")?.value;

  console.log(`[Middleware] Token present: ${!!token}`);

  try {
    // Handle public paths (maintenance, login, signup)
    if (isPublicPath) {
      // If user has valid token and is on login/signup, redirect to dashboard
      if (token && (actualPath.startsWith("/login") || actualPath.startsWith("/signup"))) {
        if (await verifyToken(token)) {
          console.log("[Middleware] Valid token on login page, redirecting to dashboard");
          return redirectTo(request, "/dashboard");
        }
      }
      return i18nResponse;
    }

    // Handle dashboard (protected path)
    if (!token) {
      console.log("[Middleware] No token found for dashboard, redirecting to maintenance");
      return redirectTo(request, "/maintenance");
    }

    // Verify token for dashboard access
    if (await verifyToken(token)) {
      console.log("[Middleware] Token valid, proceeding with dashboard request");
      return i18nResponse;
    }

    console.log("[Middleware] Token invalid, redirecting to maintenance");
    return redirectTo(request, "/maintenance");
  } catch (error) {
    console.log("[Middleware] Error during token verification:", error);
    return redirectTo(request, "/maintenance");
  }
}

export const config = {
  matcher: [
    "/",
    "/(en|fr)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
