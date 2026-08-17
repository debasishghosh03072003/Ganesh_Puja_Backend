import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ganesh_puja_db';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage in Next.js.
 */
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose | undefined;
}

let cached: GlobalMongoose = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('MongoDB connected successfully');
      return m;
    }).catch((err) => {
      console.error('MongoDB connection error:', err.message || err);
      cached.promise = null;
      if (err.message && (err.message.includes('whitelist') || err.message.includes('server selection') || err.message.includes('ReplicaSetNoPrimary'))) {
        throw new Error('Database Connection Failed: MongoDB Atlas IP Whitelist Blocked. Please add 0.0.0.0/0 or your current IP in MongoDB Atlas Network Access.');
      }
      throw new Error('Database Connection Failed: Unable to connect to MongoDB. Please ensure MongoDB is running or configure MONGODB_URI in .env.local');
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
