import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { X_HEADER_USER_ID } from "@/app/constant";

export async function GET(request) {
  try {
    // Check whether the request came through an authenticated session
    const adminId = request.headers.get(X_HEADER_USER_ID);

    if (!adminId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    // Only the admin user (id = -1) can access the user list
    if (String(adminId) !== "-1") {
      return NextResponse.json(
        { message: "Forbidden: Admin only" },
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    // Connect to MongoDB
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    // TEMPORARY DEBUGGING
    // This tells us which database/cluster Vercel is actually using.
    console.log("=== PRODUCTION DB DEBUG ===");
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("DB_HOST:", new URL(process.env.DB_URI).host);
    console.log(
      "COLLECTIONS:",
      await db.listCollections().toArray(),
    );

    // Get all users, but never send passwords to the frontend
    const users = await db
      .collection("user")
      .find({})
      .project({ password: 0 })
      .toArray();

    // Convert MongoDB ObjectId to string
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(
      { users: formattedUsers },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.log("==> Get users exception:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}