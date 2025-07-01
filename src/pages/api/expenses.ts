import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db(); // default DB from URI
  const collection = db.collection("expenses");

  if (req.method === "GET") {
    const { month } = req.query;
    
    if (month && typeof month === "string") {
      // Filter expenses by month (e.g., "2025-07")
      const regex = new RegExp(`^${month}`);
      const items = await collection.find({ date: { $regex: regex } }).toArray();
      
      // Get target for this month from targets collection
      const targetsCollection = db.collection("targets");
      const targetDoc = await targetsCollection.findOne({ month });
      const target = targetDoc?.target ?? null;
      
      res.status(200).json({ items, target });
    } else {
      // Get all expenses (no month filter)
      const items = await collection.find({}).toArray();
      res.status(200).json({ items });
    }
  } else if (req.method === "POST") {
    const { type, date, index, newItem, month, target } = req.body;
    
    if (type === "add") {
      // Add new expense for a date
      const day = await collection.findOne({ date });
      if (!day) {
        await collection.insertOne({ date, items: [newItem] });
      } else {
        await collection.updateOne({ date }, { $push: { items: newItem } });
      }
      res.status(200).json({ ok: true });
    } else if (type === "update") {
      // Add/update expense (used by RTK Query update mutation)
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
    } else if (type === "target") {
      // Update target for a month
      const targetsCollection = db.collection("targets");
      await targetsCollection.updateOne(
        { month },
        { $set: { month, target } },
        { upsert: true }
      );
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ ok: false, error: "Invalid type" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}