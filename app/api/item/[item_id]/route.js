import { getClientPromise } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { item_id } = await params;

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const item = await db
      .collection("item")
      .findOne({
        _id: new ObjectId(item_id),
        status: { $ne: "DELETED" },
      });

    if (item) {
      return NextResponse.json(
        { item },
        { status: 200, headers: corsHeaders }
      );
    } else {
      return errorResponse("Item not found", 404);
    }
  } catch (error) {
    console.log("GET Item Exception", error);
    return errorResponse("GET Item Internal Error", 500);
  }
}

export async function DELETE(request, { params }) {
  const { item_id } = await params;

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const updateResult = await db
      .collection("item")
      .updateOne(
        { _id: new ObjectId(item_id) },
        { $set: { status: "DELETED" } }
      );

    if (updateResult.modifiedCount > 0) {
      await db.collection("auditLogs").insertOne({
        action: "DELETE_ITEM",
        itemId: item_id,
        timestamp: new Date(),
      });

      return NextResponse.json(
        { message: "Soft Delete Success" },
        { status: 200, headers: corsHeaders }
      );
    } else {
      return errorResponse(
        "Item not found or already deleted",
        404
      );
    }
  } catch (error) {
    console.log("DELETE Item Exception", error);
    return errorResponse("DELETE Item Internal Error", 500);
  }
}

export async function PUT(request, { params }) {
  const { item_id } = await params;

  try {
    const data = await request.json();

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const storedItem = await db
      .collection("item")
      .findOne({ _id: new ObjectId(item_id) });

    if (storedItem) {
      storedItem.name = data.name;
      storedItem.price = data.price;
      storedItem.amount = data.amount;
      storedItem.category = data.category;

      const updatedResult = await db
        .collection("item")
        .updateOne(
          { _id: new ObjectId(item_id) },
          { $set: storedItem }
        );

      const updateOk = Number(updatedResult.modifiedCount) > 0;

      if (updateOk) {
        await db.collection("auditLogs").insertOne({
          action: "UPDATE_ITEM",
          itemId: item_id,
          timestamp: new Date(),
        });

        return NextResponse.json(
          { message: "Item update success" },
          { status: 200, headers: corsHeaders }
        );
      } else {
        return errorResponse(
          "Item update failed",
          400
        );
      }
    } else {
      return errorResponse(
        "Item not found",
        404
      );
    }
  } catch (error) {
    console.log("PUT Item Exception", error);
    return errorResponse("PUT Item Internal Error", 500);
  }
}
