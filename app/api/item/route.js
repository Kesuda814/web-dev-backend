import { getClientPromise } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

export async function GET(request) {
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const itemList = await db
      .collection("item")
      .find({ status: { $ne: "DELETED" } })
      .toArray();

    return NextResponse.json(
      { itemList },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.log("GET Items Exception", error);
    return errorResponse("GET Item Internal Error", 500);
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const name = data.name;
    const category = data.category;
    const price = data.price;
    const amount = data.amount;

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const insertResult = await db.collection("item").insertOne({
      name: name,
      category: category,
      price: price,
      amount: amount,
      status: "ACTIVE",
    });

    await db.collection("auditLogs").insertOne({
      action: "CREATE_ITEM",
      itemId: insertResult.insertedId,
      itemName: name,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { id: insertResult.insertedId },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.log("POST Items Exception", error);
    return errorResponse("POST Item Internal Error", 500);
  }
}
