import dns from "dns";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

type MongooseGlobal = typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const globalWithMongoose = globalThis as MongooseGlobal;

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (globalWithMongoose.mongoose?.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  const mongooseCache = globalWithMongoose.mongoose;

  if (!mongooseCache?.promise) {
    mongoose.set("strictQuery", false);

    const connectWithFallback = async () => {
      try {
        return await mongoose.connect(uri);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          uri.startsWith("mongodb+srv://") &&
          message.includes("querySrv") &&
          message.includes("ECONNREFUSED")
        ) {
          dns.setServers(["8.8.8.8", "1.1.1.1"]);
          return await mongoose.connect(uri);
        }
        throw error;
      }
    };

    mongooseCache!.promise = connectWithFallback();
  }

  mongooseCache!.conn = await mongooseCache!.promise;
  return mongooseCache!.conn;
}

export default connectToDatabase;
