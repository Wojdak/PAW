import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri);
let db: Db;

const connectToDatabase = async (): Promise<Db> => {
    try {
        await client.connect();
        db = client.db('ManageMe');
        console.log('Connected to MongoDB');
        return db;
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

export { db, connectToDatabase };