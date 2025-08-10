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

// Insert demo users
db.users.insertMany([
  {
    email: "admin@example.com",
    password: "admin123", // Plain text for demo - will be hashed by auth controller
    name: "Admin User",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: "user@example.com",
    password: "user123", // Plain text for demo - will be hashed by auth controller
    name: "Demo User",
    role: "user",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

// Insert demo sensors
db.sensors.insertMany([
  {
    sensorId: "TEMP_001",
    name: "Server Room Temperature",
    type: "temperature",
    location: "Server Room",
    unit: "°C",
    minValue: 18,
    maxValue: 30,
    alertThreshold: { min: 18, max: 28 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "TEMP_002",
    name: "Office Temperature",
    type: "temperature",
    location: "Main Office",
    unit: "°C",
    minValue: 18,
    maxValue: 32,
    alertThreshold: { min: 20, max: 30 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "HUM_001",
    name: "Server Room Humidity",
    type: "humidity",
    location: "Server Room",
    unit: "%",
    minValue: 30,
    maxValue: 70,
    alertThreshold: { min: 35, max: 60 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "HUM_002",
    name: "Office Humidity",
    type: "humidity",
    location: "Main Office",
    unit: "%",
    minValue: 30,
    maxValue: 80,
    alertThreshold: { min: 40, max: 70 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "POW_001",
    name: "Main Power Panel",
    type: "power",
    location: "Electrical Room",
    unit: "kW",
    minValue: 0,
    maxValue: 25,
    alertThreshold: { min: 1, max: 20 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "POW_002",
    name: "UPS System",
    type: "power",
    location: "Server Room",
    unit: "kW",
    minValue: 0,
    maxValue: 15,
    alertThreshold: { min: 0.5, max: 12 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    sensorId: "PRESSURE_001",
    name: "HVAC Pressure Sensor",
    type: "pressure",
    location: "HVAC System",
    unit: "hPa",
    minValue: 900,
    maxValue: 1100,
    alertThreshold: { min: 950, max: 1050 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print("Database initialized successfully with demo data!");
