import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI || ""; // Your MongoDB URI
const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process with failure if MongoDB connection fails
  }
};

export const db = client.db('wine-favorites'); // You can use db() to interact with the database*/
