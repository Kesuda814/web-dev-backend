import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { X_HEADER_USER_ID } from "@/app/constant";

export async function GET(request) {
  try {
    // Check authentication
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

    // Only admin can access users
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

    // Get collection names
    const collections = await db.listCollections().toArray();

    // Get users
    const users = await db
      .collection("user")
      .find({})
      .project({ password: 0 })
      .toArray();

    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    // TEMPORARY DEBUG RESPONSE
    return NextResponse.json(
      {
        DEBUG: true,
        DB_NAME: process.env.DB_NAME,
        DB_HOST: new URL(process.env.DB_URI).host,
        COLLECTIONS: collections.map((collection) => collection.name),
        users: formattedUsers,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.log("==> Get users exception:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}