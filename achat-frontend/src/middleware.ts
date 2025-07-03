import createI18nMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

// Create i18n middleware
const i18nMiddleware = createI18nMiddleware(routing);

// Constants
const SUPPORTED_LOCALES = ["en", "fr"];
const PUBLIC_PATHS = [
  "/login",
  "/login/2fa",
  "/signup",
  "/forgot-password",
  "/public-requests",
];

const verifyToken = async (token: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DOCKER || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error('[Middleware] Token verification fetch error:', error);
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

  const isPublicPath =
    PUBLIC_PATHS.some((path) => request.nextUrl.pathname.includes(path)) ||
    actualSegments.length === 0;
  const token = request.cookies.get("access_token")?.value;

  console.log(
    `[Middleware] Is public path: ${isPublicPath}, Token present: ${!!token}`
  );

  try {
    // Handle public paths
    if (isPublicPath) {
      if (token && (await verifyToken(token))) {
        console.log(
          "[Middleware] Token valid on public path, redirecting to dashboard"
        );
        return redirectTo(request, "/dashboard");
      }
      return i18nResponse;
    }

    // Handle protected paths
    if (!token) {
      console.log("[Middleware] No token found, redirecting to login");
      return redirectTo(request, "/login");
    }

    // Verify token for protected routes
    if (await verifyToken(token)) {
      console.log("[Middleware] Token valid, proceeding with request");
      return i18nResponse;
    }

    console.log("[Middleware] Token invalid, redirecting to login");
    return redirectTo(request, "/login");
  } catch (error) {
    console.log("[Middleware] Error during token verification:", error);
    return redirectTo(request, "/login");
  }
}

export const config = {
  matcher: [
    "/",
    "/(en|fr)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
