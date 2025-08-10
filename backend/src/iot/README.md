# IoT Module - Sensor Management & Data Processing

## 📖 Overview

The **IoT module** is the heart of the dashboard, handling all sensor-related operations including device management, real-time data processing, historical data storage, and alert monitoring. It provides both REST APIs and GraphQL endpoints for flexible data access.

### 🎯 Why This IoT Architecture?

1. **Scalable Data Ingestion**: Handles high-frequency sensor data efficiently
2. **Real-Time Processing**: Immediate data validation and alert detection
3. **Flexible Queries**: Both REST and GraphQL for different use cases
4. **Data Simulation**: Built-in mock data for development and testing
5. **Alert System**: Configurable thresholds with real-time monitoring

## 📁 IoT Module Structure

```
iot/
├── 📄 iot.module.ts              # Module configuration and dependencies
├── 📄 iot.controller.ts          # REST API endpoints for sensor operations
├── 📄 iot.service.ts             # Core business logic and data processing
├── 📄 iot.resolver.ts            # GraphQL resolvers for flexible queries
├── 📄 sensor.schema.ts           # Sensor device MongoDB schema
├── 📄 sensor-data.schema.ts      # Sensor data readings MongoDB schema
└── 📄 data-simulation.service.ts # Mock data generation for development
```

## 🔌 API Endpoints

### **REST API Routes**

```typescript
// Sensor Management
GET    /iot/sensors              # List all sensors
POST   /iot/sensors              # Create new sensor
GET    /iot/sensors/:id          # Get specific sensor details
PUT    /iot/sensors/:id          # Update sensor configuration
DELETE /iot/sensors/:id          # Delete sensor
PATCH  /iot/sensors/:id/toggle   # Activate/deactivate sensor

// Data Operations
GET    /iot/sensors/:id/data     # Get latest sensor reading
POST   /iot/sensors/:id/data     # Add new sensor reading
GET    /iot/sensors/:id/history  # Get historical data with filters
GET    /iot/sensors/:id/stats    # Get sensor statistics

// Dashboard Endpoints
GET    /iot/latest               # Get latest readings from all sensors
GET    /iot/alerts               # Get active alerts
```

### **GraphQL Schema**

```graphql
type Sensor {
  id: ID!
  name: String!
  type: String!
  location: String
  isActive: Boolean!
  unit: String!
  minValue: Float
  maxValue: Float
  alertThreshold: AlertThreshold
  currentData: SensorData
  lastDataReceived: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SensorData {
  id: ID!
  sensorId: String!
  value: Float!
  timestamp: DateTime!
  quality: Int
  metadata: JSON
}

type AlertThreshold {
  min: Float
  max: Float
}

# Queries
type Query {
  sensors: [Sensor!]!
  sensor(id: ID!): Sensor
  sensorData(sensorId: ID!, limit: Int, offset: Int): [SensorData!]!
  activeSensors: [Sensor!]!
  sensorsByType(type: String!): [Sensor!]!
}

# Mutations
type Mutation {
  createSensor(input: CreateSensorInput!): Sensor!
  updateSensor(id: ID!, input: UpdateSensorInput!): Sensor!
  deleteSensor(id: ID!): Boolean!
  addSensorData(input: AddSensorDataInput!): SensorData!
}

# Subscriptions
type Subscription {
  sensorDataUpdated(sensorId: ID): SensorData!
  sensorAlert(sensorId: ID): Alert!
}
```

## 🏗️ Database Schema Design

### **Sensor Schema**

**File**: `sensor.schema.ts`

```typescript
@Schema({ timestamps: true })
export class Sensor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ 
    required: true, 
    enum: ['temperature', 'humidity', 'pressure', 'light', 'motion', 'air_quality'],
    index: true 
  })
  type: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ required: true })
  unit: string; // '°C', '%', 'hPa', 'lux', 'ppm', etc.

  @Prop()
  minValue?: number;

  @Prop()
  maxValue?: number;

  @Prop({
    type: {
      min: { type: Number, required: false },
      max: { type: Number, required: false }
    },
    _id: false
  })
  alertThreshold?: {
    min?: number;
    max?: number;
  };

  @Prop({ default: Date.now, index: true })
  lastDataReceived: Date;

  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>; // Device-specific settings

  @Prop()
  description?: string;

  @Prop({ default: 'online', enum: ['online', 'offline', 'maintenance'] })
  status: string;
}

export type SensorDocument = Sensor & Document;
export const SensorSchema = SchemaFactory.createForClass(Sensor);

// Compound indexes for efficient queries
SensorSchema.index({ type: 1, isActive: 1 });
SensorSchema.index({ location: 1, isActive: 1 });
```

### **Sensor Data Schema**

**File**: `sensor-data.schema.ts`

```typescript
@Schema({ 
  timestamps: true,
  // Automatic expiration for old data (optional)
  expires: process.env.DATA_RETENTION_DAYS ? 
    parseInt(process.env.DATA_RETENTION_DAYS) * 24 * 60 * 60 : 
    undefined
})
export class SensorData {
  @Prop({ required: true, ref: 'Sensor', index: true })
  sensorId: string;

  @Prop({ required: true })
  value: number;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;

  @Prop({ min: 0, max: 100 })
  quality?: number; // Data quality indicator (0-100)

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional sensor information

  @Prop({ default: false })
  isAlert?: boolean; // Whether this reading triggered an alert

  @Prop()
  deviceId?: string; // Physical device identifier

  @Prop()
  batchId?: string; // For batch data imports
}

export type SensorDataDocument = SensorData & Document;
export const SensorDataSchema = SchemaFactory.createForClass(SensorData);

// Optimized indexes for time-series queries
SensorDataSchema.index({ sensorId: 1, timestamp: -1 });
SensorDataSchema.index({ timestamp: -1 });
SensorDataSchema.index({ sensorId: 1, isAlert: 1, timestamp: -1 });
```

**Why This Schema Design?**

1. **Time-Series Optimization**: Indexes optimized for time-based queries
2. **Flexible Metadata**: JSON fields for extensibility
3. **Alert Integration**: Built-in alert detection fields
4. **Data Quality**: Quality indicators for sensor reliability
5. **Compound Indexes**: Efficient multi-field queries

## 🔧 Core Service Logic

### **IoT Service Implementation**

**File**: `iot.service.ts`

```typescript
@Injectable()
export class IotService {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    @InjectModel(SensorData.name) private sensorDataModel: Model<SensorDataDocument>,
    private websocketService: WebSocketService,
  ) {}

  // Sensor Management
  async createSensor(createSensorDto: CreateSensorDto): Promise<Sensor> {
    try {
      const sensor = new this.sensorModel(createSensorDto);
      const savedSensor = await sensor.save();
      
      // Notify WebSocket clients of new sensor
      this.websocketService.broadcastSensorUpdate({
        type: 'sensor-created',
        sensor: savedSensor,
      });
      
      return savedSensor;
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        throw new ConflictException('Sensor with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create sensor');
    }
  }

  async getAllSensors(): Promise<Sensor[]> {
    return this.sensorModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async getSensorById(id: string): Promise<Sensor> {
    const sensor = await this.sensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return sensor;
  }

  async updateSensor(id: string, updateDto: UpdateSensorDto): Promise<Sensor> {
    const updatedSensor = await this.sensorModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    
    if (!updatedSensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }

    // Broadcast update to WebSocket clients
    this.websocketService.broadcastSensorUpdate({
      type: 'sensor-updated',
      sensor: updatedSensor,
    });

    return updatedSensor;
  }

  // Data Processing
  async addSensorData(sensorId: string, dataDto: AddSensorDataDto): Promise<SensorData> {
    // Validate sensor exists
    const sensor = await this.getSensorById(sensorId);
    
    if (!sensor.isActive) {
      throw new BadRequestException('Cannot add data to inactive sensor');
    }

    // Create sensor data record
    const sensorData = new this.sensorDataModel({
      sensorId,
      value: dataDto.value,
      timestamp: dataDto.timestamp || new Date(),
      quality: dataDto.quality || 100,
      metadata: dataDto.metadata,
    });

    // Check for alerts
    const isAlert = this.checkAlertThreshold(sensor, dataDto.value);
    sensorData.isAlert = isAlert;

    // Save data
    const savedData = await sensorData.save();

    // Update sensor's last data received
    await this.sensorModel.findByIdAndUpdate(sensorId, {
      lastDataReceived: savedData.timestamp,
    });

    // Broadcast real-time update
    this.websocketService.broadcastSensorData({
      sensorId,
      data: savedData,
      isAlert,
    });

    return savedData;
  }

  async getSensorHistory(
    sensorId: string, 
    options: HistoryQueryOptions
  ): Promise<SensorData[]> {
    const query: any = { sensorId };
    
    // Time range filtering
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        query.timestamp.$lte = new Date(options.endDate);
      }
    }

    return this.sensorDataModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 1000)
      .skip(options.offset || 0)
      .exec();
  }

  async getLatestSensorData(): Promise<Array<{ sensor: Sensor; data: SensorData }>> {
    const sensors = await this.getAllSensors();
    const result = [];

    for (const sensor of sensors) {
      const latestData = await this.sensorDataModel
        .findOne({ sensorId: sensor._id })
        .sort({ timestamp: -1 })
        .exec();
      
      result.push({
        sensor,
        data: latestData,
      });
    }

    return result;
  }

  // Alert System
  private checkAlertThreshold(sensor: Sensor, value: number): boolean {
    if (!sensor.alertThreshold) return false;

    const { min, max } = sensor.alertThreshold;
    
    if (min !== undefined && value < min) return true;
    if (max !== undefined && value > max) return true;
    
    return false;
  }

  async getActiveAlerts(): Promise<Array<{ sensor: Sensor; data: SensorData[] }>> {
    const alertData = await this.sensorDataModel
      .find({ 
        isAlert: true,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
      .sort({ timestamp: -1 })
      .populate('sensorId')
      .exec();

    // Group by sensor
    const groupedAlerts = new Map();
    
    for (const data of alertData) {
      const sensorId = data.sensorId.toString();
      if (!groupedAlerts.has(sensorId)) {
        groupedAlerts.set(sensorId, {
          sensor: data.sensorId,
          data: [],
        });
      }
      groupedAlerts.get(sensorId).data.push(data);
    }

    return Array.from(groupedAlerts.values());
  }

  // Statistics
  async getSensorStats(sensorId: string, timeRange: string): Promise<SensorStats> {
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on time range
    switch (timeRange) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      default:
        startDate.setDate(endDate.getDate() - 1);
    }

    // Aggregate statistics
    const stats = await this.sensorDataModel.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          alertCount: { 
            $sum: { $cond: [{ $eq: ['$isAlert', true] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      count: 0,
      avgValue: 0,
      minValue: 0,
      maxValue: 0,
      alertCount: 0,
    };
  }
}
```

**Why This Service Design?**

1. **Error Handling**: Comprehensive error handling with meaningful messages
2. **Real-Time Integration**: WebSocket broadcasts for live updates
3. **Alert Processing**: Automatic alert detection and notification
4. **Efficient Queries**: Optimized database queries with proper indexing
5. **Statistics**: Built-in analytics for sensor performance monitoring

## 📊 Data Simulation Service

### **Mock Data Generation**

**File**: `data-simulation.service.ts`

```typescript
@Injectable()
export class DataSimulationService {
  private simulationInterval: NodeJS.Timeout;
  private isSimulating = false;

  constructor(
    private iotService: IotService,
    private websocketService: WebSocketService,
  ) {}

  async startSimulation(): Promise<void> {
    if (this.isSimulating) return;

    this.isSimulating = true;
    console.log('🌡️ Starting IoT data simulation...');

    // Generate data every 5 seconds
    this.simulationInterval = setInterval(async () => {
      await this.generateSensorData();
    }, 5000);

    // Initial data generation
    await this.ensureTestSensors();
    await this.generateSensorData();
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.isSimulating = false;
      console.log('🛑 Stopped IoT data simulation');
    }
  }

  private async ensureTestSensors(): Promise<void> {
    const testSensors = [
      {
        name: 'Office Temperature',
        type: 'temperature',
        location: 'Main Office',
        unit: '°C',
        minValue: 15,
        maxValue: 30,
        alertThreshold: { min: 18, max: 26 },
      },
      {
        name: 'Warehouse Humidity',
        type: 'humidity',
        location: 'Warehouse A',
        unit: '%',
        minValue: 30,
        maxValue: 80,
        alertThreshold: { min: 40, max: 70 },
      },
      {
        name: 'Lab Pressure',
        type: 'pressure',
        location: 'Research Lab',
        unit: 'hPa',
        minValue: 980,
        maxValue: 1020,
        alertThreshold: { min: 990, max: 1010 },
      },
    ];

    for (const sensorData of testSensors) {
      try {
        await this.iotService.createSensor(sensorData);
      } catch (error) {
        // Sensor might already exist, continue
      }
    }
  }

  private async generateSensorData(): Promise<void> {
    try {
      const sensors = await this.iotService.getAllSensors();

      for (const sensor of sensors) {
        const value = this.generateRealisticValue(sensor);
        
        await this.iotService.addSensorData(sensor._id.toString(), {
          value,
          quality: Math.floor(Math.random() * 20) + 80, // 80-100% quality
          metadata: {
            generatedAt: new Date().toISOString(),
            source: 'simulation',
          },
        });
      }
    } catch (error) {
      console.error('Error generating sensor data:', error);
    }
  }

  private generateRealisticValue(sensor: Sensor): number {
    const { type, minValue = 0, maxValue = 100 } = sensor;
    
    // Generate values based on sensor type with realistic patterns
    switch (type) {
      case 'temperature':
        // Temperature with daily cycle and some randomness
        const hour = new Date().getHours();
        const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 3; // ±3°C daily variation
        const baseTemp = (minValue + maxValue) / 2;
        const randomVariation = (Math.random() - 0.5) * 2; // ±1°C random
        return Math.round((baseTemp + dailyCycle + randomVariation) * 10) / 10;

      case 'humidity':
        // Humidity tends to be inversely related to temperature
        const baseHumidity = (minValue + maxValue) / 2;
        const variation = (Math.random() - 0.5) * 10; // ±5% variation
        return Math.max(minValue, Math.min(maxValue, Math.round(baseHumidity + variation)));

      case 'pressure':
        // Atmospheric pressure with slow changes
        const basePressure = (minValue + maxValue) / 2;
        const pressureVariation = (Math.random() - 0.5) * 5; // ±2.5 hPa
        return Math.round((basePressure + pressureVariation) * 10) / 10;

      default:
        // Generic random value within range
        return Math.round((Math.random() * (maxValue - minValue) + minValue) * 100) / 100;
    }
  }

  // Manual data generation for testing
  async generateTestData(sensorId: string, count: number = 100): Promise<void> {
    const sensor = await this.iotService.getSensorById(sensorId);
    const dataPoints = [];

    // Generate historical data points
    for (let i = count; i > 0; i--) {
      const timestamp = new Date(Date.now() - i * 60000); // 1 minute intervals
      const value = this.generateRealisticValue(sensor);
      
      dataPoints.push({
        value,
        timestamp,
        quality: Math.floor(Math.random() * 20) + 80,
        metadata: { source: 'test-generation' },
      });
    }

    // Batch insert for performance
    for (const dataPoint of dataPoints) {
      await this.iotService.addSensorData(sensorId, dataPoint);
    }

    console.log(`Generated ${count} test data points for sensor ${sensor.name}`);
  }
}
```

**Why Data Simulation?**

1. **Development Support**: Provides realistic data for frontend development
2. **Testing**: Consistent data patterns for testing algorithms
3. **Demo Purposes**: Live demonstrations without real hardware
4. **Load Testing**: Generate high-volume data to test performance
5. **Pattern Recognition**: Different sensor types have realistic behavior patterns

## 🔄 Real-Time Integration

### **WebSocket Events**

```typescript
// Events emitted by IoT service
interface SensorDataEvent {
  sensorId: string;
  data: SensorData;
  isAlert: boolean;
}

interface SensorUpdateEvent {
  type: 'sensor-created' | 'sensor-updated' | 'sensor-deleted';
  sensor: Sensor;
}

// WebSocket event handling
@Injectable()
export class WebSocketService {
  constructor(@InjectGateway() private gateway: WebSocketGateway) {}

  broadcastSensorData(event: SensorDataEvent): void {
    // Broadcast to all clients
    this.gateway.server.emit('sensor-data', event);
    
    // Broadcast to sensor-specific subscribers
    this.gateway.server
      .to(`sensor-${event.sensorId}`)
      .emit('sensor-update', event);
  }

  broadcastSensorUpdate(event: SensorUpdateEvent): void {
    this.gateway.server.emit('sensor-config-update', event);
  }
}
```

## 🧪 Testing IoT Functionality

### **Service Testing**
```typescript
describe('IotService', () => {
  let service: IotService;
  let sensorModel: Model<SensorDocument>;
  let sensorDataModel: Model<SensorDataDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IotService,
        {
          provide: getModelToken(Sensor.name),
          useValue: mockSensorModel,
        },
        {
          provide: getModelToken(SensorData.name),
          useValue: mockSensorDataModel,
        },
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
      ],
    }).compile();

    service = module.get<IotService>(IotService);
  });

  it('should create a sensor', async () => {
    const sensorDto = {
      name: 'Test Sensor',
      type: 'temperature',
      unit: '°C',
    };

    const result = await service.createSensor(sensorDto);

    expect(result.name).toBe(sensorDto.name);
    expect(result.type).toBe(sensorDto.type);
  });

  it('should detect alert threshold violations', async () => {
    const sensor = {
      _id: 'sensor_id',
      alertThreshold: { min: 20, max: 25 },
    };

    const alertValue = 30; // Above max threshold
    const isAlert = service['checkAlertThreshold'](sensor, alertValue);

    expect(isAlert).toBe(true);
  });

  it('should calculate sensor statistics correctly', async () => {
    const sensorId = 'test_sensor_id';
    const mockStats = {
      count: 100,
      avgValue: 22.5,
      minValue: 18.0,
      maxValue: 27.0,
      alertCount: 5,
    };

    sensorDataModel.aggregate = jest.fn().mockResolvedValue([mockStats]);

    const result = await service.getSensorStats(sensorId, '24h');

    expect(result).toEqual(mockStats);
  });
});
```

### **Controller Testing**
```typescript
describe('IotController', () => {
  let controller: IotController;
  let service: IotService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [IotController],
      providers: [
        {
          provide: IotService,
          useValue: mockIotService,
        },
      ],
    }).compile();

    controller = module.get<IotController>(IotController);
    service = module.get<IotService>(IotService);
  });

  it('should return all sensors', async () => {
    const mockSensors = [
      { id: '1', name: 'Sensor 1', type: 'temperature' },
      { id: '2', name: 'Sensor 2', type: 'humidity' },
    ];

    service.getAllSensors = jest.fn().mockResolvedValue(mockSensors);

    const result = await controller.getAllSensors();

    expect(result.data).toEqual(mockSensors);
    expect(service.getAllSensors).toHaveBeenCalled();
  });
});
```

## 📊 Performance Optimizations

### **Database Query Optimization**
```typescript
// Efficient pagination for large datasets
async getSensorHistory(
  sensorId: string,
  options: HistoryQueryOptions
): Promise<{ data: SensorData[]; total: number; hasMore: boolean }> {
  const query = { sensorId };
  
  // Build time range filter
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = new Date(options.startDate);
    if (options.endDate) query.timestamp.$lte = new Date(options.endDate);
  }

  // Execute query with pagination
  const [data, total] = await Promise.all([
    this.sensorDataModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit + 1) // Get one extra to check if there are more
      .skip(options.offset)
      .lean() // Return plain objects for better performance
      .exec(),
    this.sensorDataModel.countDocuments(query).exec(),
  ]);

  const hasMore = data.length > options.limit;
  if (hasMore) data.pop(); // Remove the extra item

  return { data, total, hasMore };
}
```

### **Caching Strategy**
```typescript
// Cache frequently accessed sensor metadata
@Injectable()
export class IotService {
  private sensorCache = new Map<string, { sensor: Sensor; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getSensorById(id: string): Promise<Sensor> {
    // Check cache first
    const cached = this.sensorCache.get(id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.sensor;
    }

    // Fetch from database
    const sensor = await this.sensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }

    // Update cache
    this.sensorCache.set(id, { sensor, timestamp: Date.now() });
    return sensor;
  }
}
```

### **Bulk Data Operations**
```typescript
// Efficient bulk data insertion
async bulkAddSensorData(
  sensorId: string, 
  dataPoints: AddSensorDataDto[]
): Promise<SensorData[]> {
  // Validate sensor exists
  const sensor = await this.getSensorById(sensorId);
  
  // Prepare bulk operations
  const bulkOps = dataPoints.map(dataDto => ({
    insertOne: {
      document: {
        sensorId,
        value: dataDto.value,
        timestamp: dataDto.timestamp || new Date(),
        quality: dataDto.quality || 100,
        metadata: dataDto.metadata,
        isAlert: this.checkAlertThreshold(sensor, dataDto.value),
      }
    }
  }));

  // Execute bulk insert
  const result = await this.sensorDataModel.bulkWrite(bulkOps, { ordered: false });
  
  // Update sensor's last data received
  await this.sensorModel.findByIdAndUpdate(sensorId, {
    lastDataReceived: new Date(),
  });

  return result.insertedIds;
}
```

---

*This IoT module provides a comprehensive foundation for sensor data management with real-time capabilities, efficient data processing, and scalable architecture patterns.*
