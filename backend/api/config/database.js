import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'neurofi';

let client = null;
let db = null;

// Connect to MongoDB
export const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    console.log(`📍 URI: ${MONGODB_URI}`);
    console.log(`📊 Database: ${DATABASE_NAME}`);
    
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(DATABASE_NAME);
    
    // Test the connection
    await db.admin().ping();
    
    console.log('✅ MongoDB Connected successfully');
    console.log(`🏠 Host: ${client.options.hosts[0]}`);
    console.log('🔗 Connection State: Connected');
    console.log('');
    console.log('💡 MongoDB Compass Connection:');
    console.log(`   URI: ${MONGODB_URI}`);
    console.log(`   Database: ${DATABASE_NAME}`);
    console.log('   Collections: users, cryptos');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('🔧 MongoDB Setup Instructions:');
    console.log('1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community');
    console.log('2. Install MongoDB Compass from: https://www.mongodb.com/try/download/compass');
    console.log('3. Start MongoDB service (usually runs automatically)');
    console.log('4. Verify MongoDB is running on port 27017');
    console.log('');
    console.log('💡 MongoDB Compass Connection:');
    console.log(`   URI: ${MONGODB_URI}`);
    console.log(`   Database: ${DATABASE_NAME}`);
    console.log('');
    console.log('🔍 To check if MongoDB is running:');
    console.log('   - Open MongoDB Compass and connect to mongodb://localhost:27017');
    console.log('   - Or run: mongosh --eval "db.runCommand(\'ping\')"');
    console.log('');
    return false;
  }
};

// Close database connection
export const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

// Get database instance
export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

// Get collection
export const getCollection = (collectionName) => {
  const database = getDB();
  return database.collection(collectionName);
};

// Check if connected
export const isConnected = () => {
  return client && db;
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  console.log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

export default { connectDB, closeDB, getDB, getCollection, isConnected };