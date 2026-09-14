import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { X_HEADER_USER_ID } from "@/app/constant";

export async function PUT(request) {
  try {
    // Get the currently logged-in user's ID
    const adminId = request.headers.get(X_HEADER_USER_ID);

    // Must be logged in
    if (!adminId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Only admin can change another user's password
    if (String(adminId) !== "-1") {
      return NextResponse.json(
        { message: "Forbidden: Admin only" },
        { status: 403, headers: corsHeaders },
      );
    }

    const data = await request.json();
    const { userId, newPassword } = data;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { message: "User ID and new password are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Convert the frontend's _id string into a MongoDB ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400, headers: corsHeaders },
      );
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: newPassword } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.log("==> Password change exception", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: corsHeaders },
    );
  }
}