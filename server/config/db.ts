import mongoose from 'mongoose';

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[TaskFlow Database] No MONGODB_URI provided. Running in high-fidelity mock store mode with full in-memory persistence.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[TaskFlow Database] Connected to MongoDB: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('[TaskFlow Database] MongoDB connection failed, falling back to mock store mode:', error);
    return false;
  }
}
