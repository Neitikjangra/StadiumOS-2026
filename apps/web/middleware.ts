import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHNAMES = new Set(["/login", "/sign-up"]);
const PUBLIC_PREFIXES = ["/api/auth", "/fan", "/manifest.json", "/favicon.ico"];

function isPublicPathname(pathname: string): boolean {
  if (PUBLIC_PATHNAMES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAuthenticated(request: NextRequest): boolean {
  const names = [
    "authjs.session-token",
    "next-auth.session-token",
    "__Secure-authjs.session-token",
    "__Secure-next-auth.session-token",
  ];
  for (const name of names) {
    const cookie = request.cookies.get(name);
    if (cookie?.value) return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPathname(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
