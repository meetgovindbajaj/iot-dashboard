// MongoDB initialization script
db = db.getSiblingDB("iot-dashboard");

// Create collections
db.createCollection("users");
db.createCollection("sensors");
db.createCollection("sensordatas");

// Create indexes for better performance
db.sensordatas.createIndex({ sensorId: 1, timestamp: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.sensors.createIndex({ sensorId: 1 }, { unique: true });

print("Database initialized successfully!");
