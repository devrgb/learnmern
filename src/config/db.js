import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export const connectDB = async () => {
  try {
    await client.connect();

    db = client.db(dbName);

    console.log(`Connected to database: ${db.databaseName}`);

    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized! Call connectDB first.');
  }

  return db;
};

export const disconnectDB = async () => {
  await client.close();
};