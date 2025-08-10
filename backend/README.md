# Backend - NestJS API Server

## 📖 Overview

This is the **backend API server** built with **NestJS**, providing REST APIs, GraphQL endpoints, and real-time WebSocket communication for the IoT Dashboard. It handles authentication, sensor data management, and user administration.

### 🎯 Why NestJS?

- **Enterprise-Grade**: Built with TypeScript and follows enterprise patterns
- **Modular Architecture**: Organized with modules, controllers, and services
- **Dependency Injection**: Clean code with automatic dependency management
- **Decorators**: Elegant syntax for routes, validation, and guards
- **Built-in Features**: Authentication, validation, documentation, and testing

## 📁 Project Structure

```
backend/src/
├── 📄 main.ts                 # Application entry point
├── 📄 app.module.ts           # Root application module
├── 📄 app.controller.ts       # Root controller (health checks)
├── 📄 app.service.ts          # Root service
├── 📁 auth/                   # Authentication & authorization
│   ├── 📄 auth.module.ts      # Auth module configuration
│   ├── 📄 auth.controller.ts  # Auth API endpoints
│   ├── 📄 auth.service.ts     # Auth business logic
│   ├── 📄 auth.guard.ts       # JWT authentication guard
│   ├── 📄 jwt.strategy.ts     # JWT authentication strategy
│   ├── 📄 roles.decorator.ts  # Role-based access decorator
│   └── 📄 roles.guard.ts      # Role-based access guard
├── 📁 iot/                    # IoT sensor management
│   ├── 📄 iot.module.ts       # IoT module configuration
│   ├── 📄 iot.controller.ts   # Sensor REST API endpoints
│   ├── 📄 iot.service.ts      # Sensor business logic
│   ├── 📄 iot.resolver.ts     # GraphQL resolvers
│   ├── 📄 sensor.schema.ts    # Sensor MongoDB schema
│   ├── 📄 sensor-data.schema.ts # Sensor data MongoDB schema
│   └── 📄 data-simulation.service.ts # Mock data generation
├── 📁 users/                  # User management
│   ├── 📄 users.module.ts     # Users module configuration
│   ├── 📄 users.controller.ts # User REST API endpoints
│   ├── 📄 users.service.ts    # User business logic
│   └── 📄 user.schema.ts      # User MongoDB schema
└── 📁 websocket/              # Real-time communication
    ├── 📄 websocket.module.ts # WebSocket module configuration
    ├── 📄 websocket.gateway.ts # WebSocket event handlers
    └── 📄 websocket.service.ts # WebSocket business logic
```

### 🏗️ Architecture Decisions

#### **1. Modular Structure**
- **Domain-Driven Design**: Each module represents a business domain
- **Separation of Concerns**: Controllers, services, and schemas have distinct roles
- **Dependency Injection**: Clean dependencies between modules
- **Testability**: Each module can be tested independently

#### **2. Database Choice - MongoDB**
- **Flexible Schema**: IoT data can have varying structures
- **High Write Throughput**: Handles frequent sensor data updates
- **JSON Native**: Natural fit for JavaScript/TypeScript applications
- **Horizontal Scaling**: Can scale across multiple machines

#### **3. Authentication Strategy**
- **JWT Tokens**: Stateless authentication for scalability
- **Role-Based Access**: Different permissions for admin vs regular users
- **Guards & Decorators**: Clean, declarative security implementation

## 🔌 API Architecture

### **RESTful API Design**

All APIs follow RESTful conventions:

```typescript
// Sensor endpoints
GET    /iot/sensors           # List all sensors
POST   /iot/sensors           # Create new sensor
GET    /iot/sensors/:id       # Get specific sensor
PUT    /iot/sensors/:id       # Update sensor
DELETE /iot/sensors/:id       # Delete sensor

// Sensor data endpoints
GET    /iot/sensors/:id/data  # Get latest data
GET    /iot/sensors/:id/history # Get historical data
POST   /iot/sensors/:id/data # Add new sensor reading
```

### **GraphQL Integration**

GraphQL provides flexible data querying:

```graphql
# Get sensors with their latest data
query GetSensorsWithData {
  sensors {
    id
    name
    location
    currentData {
      value
      timestamp
      unit
    }
  }
}

# Subscribe to real-time sensor updates
subscription SensorUpdates($sensorId: String!) {
  sensorDataUpdated(sensorId: $sensorId) {
    sensorId
    value
    timestamp
  }
}
```

**Why Both REST and GraphQL?**
- **REST**: Simple CRUD operations, caching, wide compatibility
- **GraphQL**: Complex queries, real-time subscriptions, flexible data fetching

## 🔐 Security Implementation

### **Authentication Flow**

```typescript
// 1. User login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// 2. Server response with JWT
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "role": "admin"
  }
}

// 3. Subsequent requests include token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### **Authorization Guards**

```typescript
// Protect routes with authentication
@UseGuards(AuthGuard)
@Controller('iot')
export class IotController {
  // All routes require authentication
}

// Protect specific routes with roles
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Delete('sensors/:id')
async deleteSensor(@Param('id') id: string) {
  // Only admins can delete sensors
}
```

### **Password Security**

```typescript
// Hash passwords with bcrypt
const hashedPassword = await bcrypt.hash(password, 12);

// Verify passwords during login
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

## 📊 Database Schema Design

### **User Schema**
```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  department?: string;

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop({ default: Date.now })
  lastLogin: Date;
}
```

### **Sensor Schema**
```typescript
@Schema({ timestamps: true })
export class Sensor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // 'temperature', 'humidity', 'pressure', etc.

  @Prop()
  location?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  minValue?: number;

  @Prop()
  maxValue?: number;

  @Prop({
    type: {
      min: Number,
      max: Number
    }
  })
  alertThreshold?: {
    min: number;
    max: number;
  };

  @Prop()
  unit: string; // '°C', '%', 'hPa', etc.

  @Prop({ default: Date.now })
  lastDataReceived: Date;
}
```

### **Sensor Data Schema**
```typescript
@Schema({ timestamps: true })
export class SensorData {
  @Prop({ required: true, ref: 'Sensor' })
  sensorId: string;

  @Prop({ required: true })
  value: number;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  quality?: number; // Data quality indicator (0-100)

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional sensor data
}
```

**Why This Schema Design?**
- **Relationships**: Clear connections between users, sensors, and data
- **Flexibility**: Metadata fields for extensibility
- **Performance**: Indexed fields for fast queries
- **Validation**: Schema-level validation for data integrity

## 🔄 Real-Time Communication

### **WebSocket Gateway**

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  // Handle client connections
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle client disconnections
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Broadcast sensor data to all clients
  broadcastSensorData(data: SensorData) {
    this.server.emit('sensor-data', data);
  }

  // Send data to specific sensor subscribers
  @SubscribeMessage('subscribe-sensor')
  handleSensorSubscription(
    client: Socket,
    @MessageBody() sensorId: string,
  ) {
    client.join(`sensor-${sensorId}`);
    this.server.to(`sensor-${sensorId}`).emit('sensor-update', {
      message: `Subscribed to sensor ${sensorId}`,
    });
  }
}
```

### **Real-Time Data Flow**

1. **Data Simulation**: Service generates mock sensor data
2. **WebSocket Broadcast**: New data sent to all connected clients
3. **Client Updates**: Frontend components update automatically
4. **Database Storage**: All data persisted for historical analysis

## 🧪 Testing Strategy

### **Unit Tests**
```typescript
describe('IotService', () => {
  let service: IotService;
  let model: Model<Sensor>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IotService,
        {
          provide: getModelToken(Sensor.name),
          useValue: mockSensorModel,
        },
      ],
    }).compile();

    service = module.get<IotService>(IotService);
    model = module.get<Model<Sensor>>(getModelToken(Sensor.name));
  });

  it('should create a sensor', async () => {
    const sensorData = { name: 'Test Sensor', type: 'temperature' };
    const createdSensor = await service.createSensor(sensorData);
    
    expect(createdSensor.name).toBe(sensorData.name);
    expect(createdSensor.type).toBe(sensorData.type);
  });
});
```

### **Integration Tests**
```typescript
describe('IotController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/iot/sensors (GET)', () => {
    return request(app.getHttpServer())
      .get('/iot/sensors')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

## 🚀 Deployment & DevOps

### **Docker Configuration**

```dockerfile
# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production=false && yarn cache clean

COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package.json yarn.lock ./

USER nestjs
EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### **Environment Configuration**

```bash
# Development
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/iot-dashboard
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Production
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://mongo:27017/iot-dashboard
JWT_SECRET=super-secure-production-key
JWT_EXPIRES_IN=24h
```

## 📊 Performance Optimizations

### **Database Indexing**
```typescript
// Optimize common queries with indexes
@Schema({
  timestamps: true,
  index: [
    { sensorId: 1, timestamp: -1 }, // Sensor data queries
    { timestamp: -1 },              // Time-based queries
    { sensorId: 1 },                // Sensor-specific queries
  ],
})
export class SensorData {
  // Schema definition
}
```

### **Caching Strategy**
```typescript
// Cache frequently accessed data
@Injectable()
export class IotService {
  private readonly cache = new Map<string, any>();

  async getSensors(): Promise<Sensor[]> {
    const cacheKey = 'sensors';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.data;
    }

    const sensors = await this.sensorModel.find({ isActive: true });
    this.cache.set(cacheKey, { data: sensors, timestamp: Date.now() });
    
    return sensors;
  }
}
```

### **Connection Pooling**
```typescript
// MongoDB connection optimization
MongooseModule.forRoot(mongoUri, {
  maxPoolSize: 10,        // Maximum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
});
```

## 🐛 Error Handling

### **Global Exception Filter**
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Log error for debugging
    console.error('Exception caught:', exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### **Validation Pipes**
```typescript
// Automatic request validation
@Post('sensors')
@UsePipes(new ValidationPipe({ transform: true }))
async createSensor(@Body() createSensorDto: CreateSensorDto) {
  return this.iotService.createSensor(createSensorDto);
}

// DTO with validation decorators
export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['temperature', 'humidity', 'pressure'])
  type: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  minValue?: number;
}
```

## 📈 Monitoring & Logging

### **Health Checks**
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
    ]);
  }
}
```

### **Request Logging**
```typescript
// Log all incoming requests
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;
        
        console.log(`${method} ${url} ${statusCode} - ${delay}ms`);
      }),
    );
  }
}
```

## 🔧 Development Workflow

### **Getting Started**

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7-jammy
   
   # Or local installation
   mongod
   ```

4. **Start development server:**
   ```bash
   yarn start:dev
   ```

### **Available Scripts**

```bash
yarn start          # Start production server
yarn start:dev      # Start development server with hot reload
yarn start:debug    # Start with debugging enabled
yarn build          # Build for production
yarn test           # Run unit tests
yarn test:e2e       # Run end-to-end tests
yarn test:cov       # Run tests with coverage
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

---

*This backend provides a robust, scalable foundation for IoT data management with modern TypeScript patterns and enterprise-grade architecture.*
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
