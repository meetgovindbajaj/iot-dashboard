# Auth Module - Authentication & Authorization

## 📖 Overview

The **Auth module** handles all authentication and authorization logic for the IoT Dashboard. It provides secure user login, JWT token management, role-based access control, and password security using industry best practices.

### 🎯 Why This Auth System?

1. **JWT Tokens**: Stateless authentication that scales horizontally
2. **Role-Based Access**: Different permissions for admin vs regular users
3. **Secure Password Handling**: bcrypt hashing with proper salt rounds
4. **Guard System**: Declarative route protection using NestJS guards
5. **Decorator Pattern**: Clean, readable authorization decorators

## 📁 Auth Module Structure

```
auth/
├── 📄 auth.module.ts           # Module configuration and dependencies
├── 📄 auth.controller.ts       # Authentication API endpoints
├── 📄 auth.service.ts          # Core authentication business logic
├── 📄 auth.guard.ts            # JWT authentication guard
├── 📄 jwt.strategy.ts          # Passport JWT strategy
├── 📄 roles.decorator.ts       # Role-based access decorator
└── 📄 roles.guard.ts           # Role-based access guard
```

## 🔐 Authentication Flow

### **1. User Registration**

```typescript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}

// Server response
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**What Happens:**
1. **Validation**: Email format, password strength checks
2. **Duplicate Check**: Ensure email isn't already registered
3. **Password Hashing**: bcrypt with 12 salt rounds for security
4. **User Creation**: Save to MongoDB with default role "user"
5. **Response**: Return user info (without password)

### **2. User Login**

```typescript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Server response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "lastLogin": "2025-08-10T10:30:00Z"
  }
}
```

**What Happens:**
1. **User Lookup**: Find user by email in database
2. **Password Verification**: Compare provided password with hashed password
3. **JWT Generation**: Create signed token with user ID and role
4. **Last Login Update**: Update user's lastLogin timestamp
5. **Response**: Return JWT token and user information

### **3. Protected Route Access**

```typescript
// Request to protected endpoint
GET /iot/sensors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// JWT payload after verification
{
  "sub": "user_id",           # User ID (subject)
  "email": "user@example.com",
  "role": "user",
  "iat": 1691234567,          # Issued at
  "exp": 1691840567           # Expires at
}
```

## 🛡️ Security Implementation

### **AuthService - Core Logic**

**File**: `auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Register new user
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with 12 salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with default role
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isActive: true,
    });

    const savedUser = await user.save();
    
    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    return userResponse;
  }

  // Authenticate user
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    // Generate JWT token
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    
    const access_token = this.jwtService.sign(payload);

    // Prepare user response (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      access_token,
      user: userResponse,
    };
  }

  // Validate user for JWT strategy
  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')  // Exclude password from result
      .exec();
    
    return user?.isActive ? user : null;
  }
}
```

**Why This Implementation?**

1. **Password Security**: bcrypt with 12 rounds (secure but not too slow)
2. **Error Handling**: Clear, consistent error messages without information leakage
3. **Account Status**: Can deactivate users without deleting them
4. **Password Exclusion**: Never send passwords in responses
5. **Last Login Tracking**: Useful for user analytics and security

### **JWT Strategy - Token Verification**

**File**: `jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  // Called for every request with valid JWT
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    return user;
  }
}
```

**How JWT Strategy Works:**
1. **Token Extraction**: Gets JWT from Authorization header
2. **Token Verification**: Validates signature and expiration
3. **User Validation**: Ensures user still exists and is active
4. **Request Context**: Attaches user to request object for controllers

### **Auth Guard - Route Protection**

**File**: `auth.guard.ts`

```typescript
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Call parent class to handle JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Handle authentication errors
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
```

**Usage Example:**
```typescript
@Controller('iot')
@UseGuards(AuthGuard)  // All routes require authentication
export class IotController {
  
  @Get('sensors')
  async getSensors(@Request() req) {
    const user = req.user;  // User automatically attached by guard
    // Controller logic
  }
}
```

## 🎯 Role-Based Authorization

### **Roles Decorator - Defining Required Roles**

**File**: `roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Decorator to specify required roles for routes
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage:**
```typescript
@Controller('admin')
export class AdminController {
  
  @Get('users')
  @Roles('admin')  // Only admin users can access
  async getAllUsers() {
    // Admin-only logic
  }
  
  @Post('sensors')
  @Roles('admin', 'manager')  // Admin or manager can access
  async createSensor() {
    // Create sensor logic
  }
}
```

### **Roles Guard - Enforcing Role Requirements**

**File**: `roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (attached by AuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Combined Usage:**
```typescript
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)  // Apply both guards
export class AdminController {
  
  @Delete('users/:id')
  @Roles('admin')  // Only admin can delete users
  async deleteUser(@Param('id') id: string) {
    // Delete user logic
  }
}
```

## 🔧 Module Configuration

### **Auth Module Setup**

**File**: `auth.module.ts`

```typescript
@Module({
  imports: [
    // User model for database operations
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    // JWT module configuration
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    }),
    
    // Passport configuration
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
```

**Why This Configuration?**
- **MongooseModule**: Provides User model for database operations
- **JwtModule**: Configures JWT signing and verification
- **PassportModule**: Integrates Passport.js strategies
- **Exports**: Makes auth services available to other modules

## 📝 Data Transfer Objects (DTOs)

### **Registration DTO**
```typescript
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
```

### **Login DTO**
```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

**Why DTOs?**
- **Validation**: Automatic request validation with decorators
- **Type Safety**: TypeScript interfaces for request/response data
- **Documentation**: Clear API contracts for frontend developers
- **Security**: Prevents unwanted fields in requests

## 🧪 Testing Authentication

### **Service Testing**
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should register a new user', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn().mockResolvedValue({
      toObject: () => ({ ...registerDto, id: 'user_id', role: 'user' }),
    });

    const result = await service.register(registerDto);

    expect(result.email).toBe(registerDto.email);
    expect(result.password).toBeUndefined(); // Password should be excluded
  });

  it('should authenticate user with valid credentials', async () => {
    const loginDto = { email: 'test@example.com', password: 'Password123!' };
    const mockUser = {
      _id: 'user_id',
      email: loginDto.email,
      password: await bcrypt.hash(loginDto.password, 12),
      isActive: true,
      toObject: () => ({ id: 'user_id', email: loginDto.email }),
    };

    userModel.findOne = jest.fn().mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

    const result = await service.login(loginDto);

    expect(result.access_token).toBeDefined();
    expect(result.user.email).toBe(loginDto.email);
  });
});
```

### **Controller Testing**
```typescript
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should register a user', async () => {
    const registerDto = { email: 'test@example.com', password: 'Password123!', name: 'Test' };
    const expectedResult = { id: 'user_id', ...registerDto, role: 'user' };

    service.register = jest.fn().mockResolvedValue(expectedResult);

    const result = await controller.register(registerDto);

    expect(service.register).toHaveBeenCalledWith(registerDto);
    expect(result).toEqual(expectedResult);
  });
});
```

## 🔐 Security Best Practices

### **1. Password Security**
```typescript
// Strong password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// High bcrypt rounds for security (12 is good balance)
const BCRYPT_ROUNDS = 12;

// Hash password
const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
```

### **2. JWT Security**
```typescript
// Environment-based secrets
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Reasonable expiration times
const JWT_EXPIRES_IN = process.env.NODE_ENV === 'production' ? '24h' : '7d';

// Payload with minimal information
const payload = {
  sub: user._id,        // Standard subject claim
  email: user.email,    // User identifier
  role: user.role,      // For authorization
  // Don't include sensitive data
};
```

### **3. Error Handling**
```typescript
// Generic error messages to prevent information leakage
if (!user || !await bcrypt.compare(password, user.password)) {
  throw new UnauthorizedException('Invalid credentials');
  // Don't specify whether email or password is wrong
}

// Rate limiting (implement in gateway/proxy)
// Account lockout after failed attempts
// Secure headers (helmet middleware)
```

## 🐛 Common Issues & Solutions

### **1. JWT Token Expiration**
```typescript
// Problem: Users get logged out unexpectedly
// Solution: Implement refresh tokens or reasonable expiration

// In production, use shorter-lived tokens
const JWT_OPTIONS = {
  expiresIn: process.env.NODE_ENV === 'production' ? '1h' : '7d',
};

// Optional: Implement refresh token rotation
async refreshToken(refreshToken: string): Promise<string> {
  // Validate refresh token
  // Generate new access token
  // Rotate refresh token
}
```

### **2. Password Reset Flow**
```typescript
// Secure password reset implementation
async requestPasswordReset(email: string): Promise<void> {
  const user = await this.userModel.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return; // Or send generic "check email" message
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await this.userModel.findByIdAndUpdate(user._id, {
    resetPasswordToken: await bcrypt.hash(resetToken, 8),
    resetPasswordExpires: resetExpires,
  });

  // Send reset email with token
  await this.emailService.sendPasswordResetEmail(email, resetToken);
}
```

### **3. Account Verification**
```typescript
// Email verification for new accounts
async register(registerDto: RegisterDto): Promise<User> {
  // Create user with email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = new this.userModel({
    ...registerDto,
    isEmailVerified: false,
    emailVerificationToken: await bcrypt.hash(verificationToken, 8),
  });

  await user.save();
  
  // Send verification email
  await this.emailService.sendVerificationEmail(
    registerDto.email, 
    verificationToken
  );

  return user;
}
```

## 📊 Performance Considerations

### **1. Database Queries**
```typescript
// Use select to exclude password field
const user = await this.userModel
  .findById(userId)
  .select('-password')  // Exclude password
  .lean()               // Return plain object (faster)
  .exec();

// Index frequently queried fields
@Schema({
  indexes: [
    { email: 1 },           // Unique email lookup
    { role: 1 },            // Role-based queries
    { isActive: 1 },        // Active user filtering
  ],
})
```

### **2. JWT Verification Caching**
```typescript
// Cache user data to avoid database hits on every request
@Injectable()
export class AuthService {
  private userCache = new Map<string, { user: User; timestamp: number }>();

  async validateUser(userId: string): Promise<User | null> {
    // Check cache first
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.user;
    }

    // Fetch from database
    const user = await this.userModel.findById(userId).select('-password');
    
    if (user) {
      this.userCache.set(userId, { user, timestamp: Date.now() });
    }

    return user;
  }
}
```

---

*This authentication system provides enterprise-grade security while maintaining developer-friendly APIs and clear separation of concerns.*
