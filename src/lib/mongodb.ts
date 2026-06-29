import mongoose, { type Mongoose } from "mongoose";

/**
 * Cached Mongoose connection for serverless / hot-reload environments.
 *
 * In development Next.js clears the module cache on every request, and on
 * serverless platforms (Vercel/Railway) each invocation may spin up a fresh
 * function instance. Without caching we would open a brand-new connection on
 * every request and exhaust the MongoDB connection pool. We therefore stash the
 * promise on the Node `global` object so it survives module reloads.
 */

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function dbConnect(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  // Read env lazily (not at module load) so the app can be imported/built
  // without a database present; the check still fails fast on first real use.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Copy .env.example to .env.local and set your MongoDB connection string.",
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "eme_people",
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
