// Migration script to add slugs to existing custom expenses
// This file can be run once to update existing data

import clientPromise from "@/utils/mongodb";
import { createUniqueSlug } from "@/utils/slugUtils";

export async function migrateCustomExpenseSlugs() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("custom_expenses");

    // Find all custom expenses without slugs
    const expensesWithoutSlugs = await collection.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "" }
      ]
    }).toArray();

    console.log(`Found ${expensesWithoutSlugs.length} custom expenses without slugs`);

    if (expensesWithoutSlugs.length === 0) {
      console.log("No migration needed - all expenses already have slugs");
      return;
    }

    // Get all existing slugs to avoid duplicates
    const existingItems = await collection.find({}, { projection: { slug: 1 } }).toArray();
    const existingSlugs = existingItems.map(item => item.slug).filter(Boolean);

    // Update each expense with a unique slug
    for (const expense of expensesWithoutSlugs) {
      const slug = createUniqueSlug(expense.title, existingSlugs);
      
      await collection.updateOne(
        { _id: expense._id },
        { 
          $set: { 
            slug,
            updatedAt: new Date()
          } 
        }
      );

      // Add the new slug to existing slugs to avoid duplicates
      existingSlugs.push(slug);
      
      console.log(`Updated "${expense.title}" with slug: "${slug}"`);
    }

    console.log(`Migration completed: ${expensesWithoutSlugs.length} expenses updated with slugs`);
    
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Export the function for use in API routes or scripts
export default migrateCustomExpenseSlugs;
