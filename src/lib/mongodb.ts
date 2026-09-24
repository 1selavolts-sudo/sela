import { Db, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || 'selavolt';

if (!uri) {
  console.warn('MONGODB_URI is not configured. MongoDB features are disabled.');
}

type MongoGlobal = typeof globalThis & {
  selavoltMongo?: { client: MongoClient; promise: Promise<MongoClient> };
};

const globalMongo = globalThis as MongoGlobal;

export async function getMongoDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!globalMongo.selavoltMongo) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    globalMongo.selavoltMongo = { client, promise: client.connect() };
  }

  const client = await globalMongo.selavoltMongo.promise;
  return client.db(databaseName);
}