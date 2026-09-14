import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
} from "@/app/constant";

export function proxy(request) {
  // Allow CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check JWT
  const user = verifyJWT(request);

  // No valid JWT
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized Request" },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  // Add logged-in user information to request headers
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(X_HEADER_USER_ID, user.id);
  requestHeaders.set(X_HEADER_USER_EMAIL, user.email);
  requestHeaders.set(X_HEADER_USER_NAME, user.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/item/:path*", "/api/user/:path*"],
};