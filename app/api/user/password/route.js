import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { X_HEADER_USER_ID } from "@/app/constant";

export async function PUT(request) {
  try {
    const userId = request.headers.get(X_HEADER_USER_ID);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const data = await request.json();
    const { password, targetUserId } = data;

    if (!password) {
      return NextResponse.json({ message: "New password is required" }, { status: 400, headers: corsHeaders });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const queryId = targetUserId ? Number(targetUserId) : Number(userId);

    await db.collection("user").updateOne(
      { id: queryId },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.log("==> Password change exception", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}