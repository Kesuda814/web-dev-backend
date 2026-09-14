import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

export async function POST(request) {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200, headers: corsHeaders }
    );

    // Clear the authentication cookie
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}
