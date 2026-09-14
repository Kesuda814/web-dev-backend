import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { X_HEADER_USER_ID } from "@/app/constant";

export async function GET(request) {
  try {
    const adminId = request.headers.get(X_HEADER_USER_ID);

    if (!adminId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    if (String(adminId) !== "-1") {
      return NextResponse.json(
        { message: "Forbidden: Admin only" },
        { status: 403, headers: corsHeaders },
      );
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const users = await db
      .collection("user")
      .find({})
      .project({ password: 0 })
      .toArray();

    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(
      { users: formattedUsers },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.log("==> Get users exception:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: corsHeaders },
    );
  }
}