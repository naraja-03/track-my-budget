import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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
    const collection = db.collection("custom_expense_transactions");

    if (req.method === "GET") {
      const { customExpenseId } = req.query;
      
      if (!customExpenseId) {
        return res.status(400).json({ ok: false, error: "Missing customExpenseId" });
      }

      // First verify that the custom expense belongs to the user
      const customExpensesCollection = db.collection("custom_expenses");
      const customExpense = await customExpensesCollection.findOne({ 
        _id: new ObjectId(customExpenseId as string),
        userEmail: userEmail
      });

      if (!customExpense) {
        return res.status(404).json({ ok: false, error: "Custom expense not found or access denied" });
      }

      const items = await collection
        .find({ customExpenseId: customExpenseId as string })
        .sort({ date: 1 })
        .toArray();
      
      res.status(200).json({ items });
    } else if (req.method === "POST") {
      const { type, customExpenseId, category, amount, note, date, operations } = req.body;
      
      // First verify that the custom expense belongs to the user
      const customExpensesCollection = db.collection("custom_expenses");
      const customExpense = await customExpensesCollection.findOne({ 
        _id: new ObjectId(customExpenseId),
        userEmail: userEmail
      });

      if (!customExpense) {
        return res.status(404).json({ ok: false, error: "Custom expense not found or access denied" });
      }
      
      if (type === "granular_update") {
        // Handle granular updates in a single API call
        if (!customExpenseId || !operations || !Array.isArray(operations)) {
          return res.status(400).json({ 
            ok: false, 
            error: "Missing required fields: customExpenseId, operations array" 
          });
        }

        console.log(`Processing ${operations.length} granular operations for custom expense ${customExpenseId}`);
        
        let addCount = 0;
        let updateCount = 0;
        let deleteCount = 0;
        
        // Process operations in order: deletes first, then updates, then adds
        const deleteOps = operations.filter(op => op.type === 'delete');
        const updateOps = operations.filter(op => op.type === 'update');
        const addOps = operations.filter(op => op.type === 'add');
        
        console.log(`Operations breakdown: ${deleteOps.length} deletes, ${updateOps.length} updates, ${addOps.length} adds`);
        
        // Process deletions
        for (const op of deleteOps) {
          if (op.id) {
            console.log(`Deleting transaction ${op.id}`);
            const deleteResult = await collection.deleteOne({ _id: new ObjectId(op.id) });
            if (deleteResult.deletedCount > 0) deleteCount++;
          }
        }
        
        // Process updates
        for (const op of updateOps) {
          if (op.id && op.transaction) {
            console.log(`Updating transaction ${op.id}:`, op.transaction);
            const updateResult = await collection.updateOne(
              { _id: new ObjectId(op.id) },
              {
                $set: {
                  category: op.transaction.category,
                  amount: Number(op.transaction.amount),
                  note: op.transaction.note || "",
                  date: op.transaction.date,
                  updatedAt: new Date(),
                }
              }
            );
            if (updateResult.matchedCount > 0) updateCount++;
          }
        }
        
        // Process additions
        for (const op of addOps) {
          if (op.transaction) {
            console.log(`Adding new transaction:`, op.transaction);
            const addResult = await collection.insertOne({
              customExpenseId,
              category: op.transaction.category,
              amount: Number(op.transaction.amount),
              note: op.transaction.note || "",
              date: op.transaction.date,
              createdAt: new Date(),
            });
            if (addResult.insertedId) addCount++;
          }
        }
        
        console.log(`Granular update completed: ${addCount} added, ${updateCount} updated, ${deleteCount} deleted`);
        
        res.status(200).json({ 
          ok: true, 
          processed: {
            added: addCount,
            updated: updateCount,
            deleted: deleteCount,
            total: addCount + updateCount + deleteCount
          }
        });
      } else {
        // Original single transaction creation
        if (!customExpenseId || !category || !amount || !date) {
          return res.status(400).json({ 
            ok: false, 
            error: "Missing required fields: customExpenseId, category, amount, date" 
          });
        }

        const result = await collection.insertOne({
          customExpenseId,
          category,
          amount: Number(amount),
          note: note || "",
          date,
          createdAt: new Date(),
        });
        
        res.status(200).json({ ok: true, id: result.insertedId });
      }
    } else if (req.method === "PUT") {
      const { id, category, amount, note, date } = req.body;
      
      if (!id || !category || !amount || !date) {
        return res.status(400).json({ 
          ok: false, 
          error: "Missing required fields: id, category, amount, date" 
        });
      }

      // First get the transaction to verify ownership
      const transaction = await collection.findOne({ _id: new ObjectId(id) });
      if (!transaction) {
        return res.status(404).json({ ok: false, error: "Transaction not found" });
      }

      // Verify that the custom expense belongs to the user
      const customExpensesCollection = db.collection("custom_expenses");
      const customExpense = await customExpensesCollection.findOne({ 
        _id: new ObjectId(transaction.customExpenseId),
        userEmail: userEmail
      });

      if (!customExpense) {
        return res.status(404).json({ ok: false, error: "Access denied" });
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            category,
            amount: Number(amount),
            note: note || "",
            date,
            updatedAt: new Date(),
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ ok: false, error: "Transaction not found" });
      }
      
      res.status(200).json({ ok: true });
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ ok: false, error: "Missing id" });
      }

      // First get the transaction to verify ownership
      const transaction = await collection.findOne({ _id: new ObjectId(id as string) });
      if (!transaction) {
        return res.status(404).json({ ok: false, error: "Transaction not found" });
      }

      // Verify that the custom expense belongs to the user
      const customExpensesCollection = db.collection("custom_expenses");
      const customExpense = await customExpensesCollection.findOne({ 
        _id: new ObjectId(transaction.customExpenseId),
        userEmail: userEmail
      });

      if (!customExpense) {
        return res.status(404).json({ ok: false, error: "Access denied" });
      }

      await collection.deleteOne({ _id: new ObjectId(id as string) });
      res.status(200).json({ ok: true });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Custom expense transactions API error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : error,
    });
  }
}
