import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";
import { getServerSession } from "next-auth/next";
import NextAuth from "./auth/[...nextauth]";
import type { Session } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, NextAuth) as Session | null;
  
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userEmail = session.user.email;
  const client = await clientPromise;
  const db = client.db(); // default DB from URI
  const collection = db.collection("expenses");

  if (req.method === "GET") {
    const { month } = req.query;
    
    if (month && typeof month === "string") {
      // Filter expenses by month and user email (e.g., "2025-07")
      const regex = new RegExp(`^${month}`);
      const items = await collection.find({ 
        date: { $regex: regex },
        userEmail: userEmail
      }).toArray();
      
      // Get target for this month from targets collection
      const targetsCollection = db.collection("targets");
      const targetDoc = await targetsCollection.findOne({ 
        month,
        userEmail: userEmail
      });
      const target = targetDoc?.target ?? null;
      
      res.status(200).json({ items, target });
    } else {
      // Get all expenses for this user (no month filter)
      const items = await collection.find({ userEmail: userEmail }).toArray();
      res.status(200).json({ items });
    }
  } else if (req.method === "POST") {
    const { type, date, index, newItem, month, target } = req.body;
    
    if (type === "add") {
      // Add new expense for a date
      const day = await collection.findOne({ date, userEmail });
      if (!day) {
        await collection.insertOne({ date, userEmail, items: [newItem] });
      } else {
        await collection.updateOne({ date, userEmail }, { $push: { items: newItem } });
      }
      res.status(200).json({ ok: true });
    } else if (type === "update") {
      // Add/update expense (used by RTK Query update mutation)
      const day = await collection.findOne({ date, userEmail });
      if (!day) {
        await collection.insertOne({ date, userEmail, items: [newItem] });
      } else {
        await collection.updateOne({ date, userEmail }, { $push: { items: newItem } });
      }
      res.status(200).json({ ok: true });
    } else if (type === "edit") {
      // Edit an expense item by index
      const day = await collection.findOne({ date, userEmail });
      if (!day) return res.status(404).json({ ok: false });
      day.items[index] = newItem;
      await collection.updateOne({ date, userEmail }, { $set: { items: day.items } });
      res.status(200).json({ ok: true });
    } else if (type === "target") {
      // Update target for a month
      const targetsCollection = db.collection("targets");
      await targetsCollection.updateOne(
        { month, userEmail },
        { $set: { month, userEmail, target } },
        { upsert: true }
      );
      res.status(200).json({ ok: true });
    } else if (type === "bulk_update") {
      // Bulk update: replace all items for a date
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ ok: false, error: "Items array required" });
      }

      // Filter out empty items
      const validItems = items.filter(item => 
        item && 
        typeof item.category === 'string' && 
        item.category.trim() &&
        typeof item.amount === 'number' && 
        item.amount > 0
      );

      if (validItems.length === 0) {
        // Delete the entire day if no valid items
        await collection.deleteOne({ date, userEmail });
      } else {
        // Update or insert the day with new items
        await collection.updateOne(
          { date, userEmail },
          { $set: { date, userEmail, items: validItems } },
          { upsert: true }
        );
      }
      
      res.status(200).json({ ok: true });
    } else if (type === "granular_update") {
      // Granular update: handle add, update, delete operations in a single call
      const { operations } = req.body;
      
      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({ ok: false, error: "Operations array required" });
      }

      console.log(`Processing ${operations.length} granular operations for date ${date}`);
      
      // Get current day data
      const day = await collection.findOne({ date, userEmail });
      const currentItems = day ? [...day.items] : [];
      
      // Process operations in order: deletes first (reverse order), then updates, then adds
      const deleteOps = operations.filter(op => op.type === 'delete').sort((a, b) => b.index - a.index);
      const updateOps = operations.filter(op => op.type === 'update');
      const addOps = operations.filter(op => op.type === 'add');
      
      console.log(`Operations breakdown: ${deleteOps.length} deletes, ${updateOps.length} updates, ${addOps.length} adds`);
      
      // Process deletions first (in reverse order to maintain indices)
      for (const op of deleteOps) {
        if (op.index >= 0 && op.index < currentItems.length) {
          console.log(`Deleting item at index ${op.index}:`, currentItems[op.index]);
          currentItems.splice(op.index, 1);
        }
      }
      
      // Process updates
      for (const op of updateOps) {
        if (op.index >= 0 && op.index < currentItems.length && op.item) {
          console.log(`Updating item at index ${op.index}:`, op.item);
          currentItems[op.index] = {
            category: op.item.category,
            amount: op.item.amount,
            note: op.item.note || ""
          };
        }
      }
      
      // Process additions
      for (const op of addOps) {
        if (op.item) {
          console.log(`Adding new item:`, op.item);
          currentItems.push({
            category: op.item.category,
            amount: op.item.amount,
            note: op.item.note || ""
          });
        }
      }
      
      // Update database
      if (currentItems.length === 0) {
        // Delete the entire day if no items left
        await collection.deleteOne({ date, userEmail });
        console.log(`Deleted entire day for ${date} (no items remaining)`);
      } else {
        // Update or insert the day with modified items
        await collection.updateOne(
          { date, userEmail },
          { $set: { date, userEmail, items: currentItems } },
          { upsert: true }
        );
        console.log(`Updated day ${date} with ${currentItems.length} items`);
      }
      
      res.status(200).json({ ok: true, itemsCount: currentItems.length });
    } else {
      res.status(400).json({ ok: false, error: "Invalid type" });
    }
  } else if (req.method === "DELETE") {
    const { date, index } = req.query;
    
    if (typeof date === "string" && typeof index === "string") {
      // Delete a specific item by index
      const itemIndex = parseInt(index, 10);
      const day = await collection.findOne({ date, userEmail });
      
      if (!day || !day.items || itemIndex < 0 || itemIndex >= day.items.length) {
        return res.status(404).json({ ok: false, error: "Item not found" });
      }
      
      // Remove the item from the array
      day.items.splice(itemIndex, 1);
      
      if (day.items.length === 0) {
        // Delete the entire day if no items left
        await collection.deleteOne({ date, userEmail });
      } else {
        // Update with remaining items
        await collection.updateOne({ date, userEmail }, { $set: { items: day.items } });
      }
      
      res.status(200).json({ ok: true });
    } else if (typeof date === "string") {
      // Delete entire day
      await collection.deleteOne({ date, userEmail });
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ ok: false, error: "Date required" });
    }
  } else if (req.method === "PUT") {
    const { date, index, item } = req.body;
    
    if (typeof date !== "string" || typeof index !== "number" || !item) {
      return res.status(400).json({ ok: false, error: "Date, index, and item required" });
    }
    
    const day = await collection.findOne({ date, userEmail });
    
    if (!day || !day.items || index < 0 || index >= day.items.length) {
      return res.status(404).json({ ok: false, error: "Item not found" });
    }
    
    // Update the specific item
    day.items[index] = {
      category: item.category,
      amount: item.amount,
      note: item.note || ""
    };
    
    await collection.updateOne({ date, userEmail }, { $set: { items: day.items } });
    
    res.status(200).json({ ok: true });
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}