import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db(); // default DB from URI
  const collection = db.collection("expenses");

  if (req.method === "GET") {
    // Get all expenses (optionally filter by date, etc.)
    const items = await collection.find({}).toArray();
    res.status(200).json({ items });
  } else if (req.method === "POST") {
    const { type, date, index, newItem } = req.body;
    if (type === "add") {
      // Add new expense for a date
      const day = await collection.findOne({ date });
      if (!day) {
        await collection.insertOne({ date, items: [newItem] });
      } else {
        await collection.updateOne({ date }, { $push: { items: newItem } });
      }
      res.status(200).json({ ok: true });
    } else if (type === "edit") {
      // Edit an expense item by index
      const day = await collection.findOne({ date });
      if (!day) return res.status(404).json({ ok: false });
      day.items[index] = newItem;
      await collection.updateOne({ date }, { $set: { items: day.items } });
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ ok: false, error: "Invalid type" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}