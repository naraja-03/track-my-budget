import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("custom_expenses");

    if (req.method === "GET") {
      const items = await collection.find({}).toArray();
      res.status(200).json({ items });
    } else if (req.method === "POST") {
      const { title, target, description } = req.body;
      const result = await collection.insertOne({ title, target, description });
      res.status(200).json({ ok: true, id: result.insertedId });
    } else if (req.method === "DELETE") {
      // Get id from query string
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, error: "Missing id" });
      await collection.deleteOne({ _id: new ObjectId(id as string) });
      res.status(200).json({ ok: true });
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("API error:", error);
    res
      .status(500)
      .json({
        ok: false,
        error: error instanceof Error ? error.message : error,
      });
  }
}
