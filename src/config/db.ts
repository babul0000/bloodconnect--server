import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in .env');
}

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const db = client.db(process.env.MONGODB_DATABASE || 'StayNest');

export const donorsCollection = db.collection('donors');
export const requestsCollection = db.collection('requests');
export const profilesCollection = db.collection('profiles');
export const usersCollection = db.collection('user');

export async function connectDB(): Promise<void> {
  await client.connect();
  console.log('Connected to MongoDB via configuration module');
}
