import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dashboard demo auth is managed in the browser until a backend is connected.
// Cookie-based server authentication can be restored when the API is ready.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
