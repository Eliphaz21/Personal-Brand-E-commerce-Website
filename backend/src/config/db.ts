import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Mongoose 6+ uses these by default but being explicit
      // Atlas can take 10–15s on first connect over slow networks; 5s was too aggressive
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
