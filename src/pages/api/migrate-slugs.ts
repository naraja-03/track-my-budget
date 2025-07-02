import type { NextApiRequest, NextApiResponse } from "next";
import { migrateCustomExpenseSlugs } from "@/utils/migrateCustomExpenseSlugs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for this migration
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log("Starting custom expense slug migration...");
    await migrateCustomExpenseSlugs();
    
    res.status(200).json({ 
      ok: true, 
      message: "Migration completed successfully" 
    });
  } catch (error) {
    console.error("Migration API error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Migration failed",
    });
  }
}
