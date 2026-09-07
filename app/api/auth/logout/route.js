import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    
    // Clear the authentication cookie by setting maxAge to 0
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // This automatically expires and deletes the cookie on logout
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}