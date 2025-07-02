import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createUniqueSlug, isObjectId } from "@/utils/slugUtils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { Session } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions) as Session | null;
  
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userEmail = session.user.email;

  try {
    const client = await clientPromise;
    const db = client.db("track-my-budget");
    const collection = db.collection("custom_expenses");

    if (req.method === "GET") {
      const { identifier } = req.query;
      
      if (identifier) {
        // Get a specific custom expense by ID or slug
        let customExpense;
        
        if (isObjectId(identifier as string)) {
          // Search by ObjectId and user email
          customExpense = await collection.findOne({ 
            _id: new ObjectId(identifier as string),
            userEmail: userEmail
          });
        } else {
          // Search by slug and user email
          customExpense = await collection.findOne({ 
            slug: identifier as string,
            userEmail: userEmail
          });
        }
        
        if (!customExpense) {
          return res.status(404).json({ ok: false, error: "Custom expense not found" });
        }
        
        res.status(200).json({ item: customExpense });
      } else {
        // Get all custom expenses for this user
        const items = await collection.find({ userEmail: userEmail }).toArray();
        res.status(200).json({ items });
      }
    } else if (req.method === "POST") {
      const { type, title, target, description } = req.body;
      
      if (type === "create") {
        // Get existing slugs for this user to ensure uniqueness
        const existingItems = await collection.find({ userEmail: userEmail }, { projection: { slug: 1 } }).toArray();
        const existingSlugs = existingItems.map(item => item.slug).filter(Boolean);
        
        // Create unique slug
        const slug = createUniqueSlug(title, existingSlugs);
        
        const result = await collection.insertOne({ 
          title, 
          target, 
          description, 
          slug,
          userEmail,
          createdAt: new Date()
        });
        
        res.status(200).json({ ok: true, id: result.insertedId, slug });
      } else {
        // Legacy support for old API calls
        const result = await collection.insertOne({ 
          title, 
          target, 
          description, 
          userEmail,
          createdAt: new Date()
        });
        res.status(200).json({ ok: true, id: result.insertedId });
      }
    } else if (req.method === "DELETE") {
      // Get id from query string
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, error: "Missing id" });
      
      if (isObjectId(id as string)) {
        await collection.deleteOne({ 
          _id: new ObjectId(id as string),
          userEmail: userEmail
        });
      } else {
        await collection.deleteOne({ 
          slug: id as string,
          userEmail: userEmail
        });
      }
      
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
