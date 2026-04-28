// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const base = process.env.NEXT_PUBLIC_BASE || "";
  const expectedHost = base ? `front.${base}` : "";
  const isLocal =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const isInternalHost = host === "front" || host.startsWith("front:");
  const isExpectedHost =
    !!expectedHost &&
    (host === expectedHost || host.startsWith(`${expectedHost}:`));

  if (expectedHost && !isLocal && (isInternalHost || isExpectedHost)) {
    const headers = new Headers(req.headers);
    headers.set("x-forwarded-host", expectedHost);
    headers.set("x-forwarded-proto", "https");
    return NextResponse.next({ request: { headers } });
  }

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Match any slug containing "cash" but not already ending with "-in-moscow"
  // if (
  //   pathname &&
  //   (pathname.startsWith("cash-") || pathname.includes("-cash-")) &&
  //   !pathname.includes("-in-")
  // ) {
  //   url.pathname = `${pathname}-in-moscow`;
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}
