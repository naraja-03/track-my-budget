import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || 'mongodb+srv://threedot:Ajar003@threedot.zjgkhdo.mongodb.net/';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Remove the check that throws an error since we have a fallback URI
// if (!process.env.MONGODB_URI) {
//   throw new Error("Please add your Mongo URI to .env");
// }

if (process.env.NODE_ENV === "development") {
  // In dev mode, use a global variable so the value is preserved across module reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
