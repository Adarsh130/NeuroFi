// MongoDB initialization script
db = db.getSiblingDB('neurofi');

// Create collections
db.createCollection('users');
db.createCollection('predictions');
db.createCollection('sentiments');
db.createCollection('recommendations');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

// Create indexes for predictions collection
db.predictions.createIndex({ "symbol": 1, "timestamp": -1 });
db.predictions.createIndex({ "timestamp": -1 });

// Create indexes for sentiments collection
db.sentiments.createIndex({ "symbol": 1, "timestamp": -1 });
db.sentiments.createIndex({ "timestamp": -1 });

// Create indexes for recommendations collection
db.recommendations.createIndex({ "symbol": 1, "timestamp": -1 });
db.recommendations.createIndex({ "userId": 1, "timestamp": -1 });

print('Database initialized successfully');