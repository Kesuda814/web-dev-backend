import corsHeaders from "./cors";
import { NextResponse } from "next/server";

export function errorResponse(message, status = 400) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: corsHeaders,
    }
  );
}