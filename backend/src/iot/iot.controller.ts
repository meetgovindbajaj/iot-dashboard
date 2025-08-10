import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Delete,
  Patch,
} from "@nestjs/common";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { JwtAuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { IotService } from "./iot.service";

export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(["temperature", "humidity", "power", "pressure"])
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsOptional()
  minValue?: number;

  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @IsOptional()
  alertThreshold?: {
    min: number;
    max: number;
  };

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  maintenanceInterval?: number;
}

export class UpdateSensorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  minValue?: number;

  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @IsOptional()
  alertThreshold?: {
    min: number;
    max: number;
  };

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  maintenanceInterval?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddSensorDataDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsOptional()
  metadata?: string;
}

@Controller("iot")
@UseGuards(JwtAuthGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get("sensors")
  async getAllSensors() {
    return this.iotService.getAllSensors();
  }

  @Post("sensors")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async createSensor(@Body() createSensorDto: CreateSensorDto) {
    return this.iotService.createSensor(createSensorDto);
  }

  @Get("sensors/:sensorId")
  async getSensorById(@Param("sensorId") sensorId: string) {
    return this.iotService.getSensorById(sensorId);
  }

  @Put("sensors/:sensorId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async updateSensor(
    @Param("sensorId") sensorId: string,
    @Body() updateSensorDto: UpdateSensorDto
  ) {
    return this.iotService.updateSensorConfig(sensorId, updateSensorDto);
  }

  @Patch("sensors/:sensorId/toggle")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async toggleSensorStatus(@Param("sensorId") sensorId: string) {
    return this.iotService.toggleSensorStatus(sensorId);
  }

  @Delete("sensors/:sensorId")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async deleteSensor(@Param("sensorId") sensorId: string) {
    await this.iotService.deleteSensor(sensorId);
    return { message: `Sensor ${sensorId} deactivated successfully` };
  }

  @Get("sensors/:sensorId/data")
  async getSensorData(
    @Param("sensorId") sensorId: string,
    @Query("limit") limit?: number
  ) {
    return this.iotService.getSensorData(sensorId, limit || 100);
  }

  @Get("sensors/:sensorId/history")
  async getHistoricalData(
    @Param("sensorId") sensorId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.iotService.getHistoricalData(sensorId, start, end);
  }

  @Get("sensors/:sensorId/stats")
  async getSensorStats(
    @Param("sensorId") sensorId: string,
    @Query("days") days?: number
  ) {
    return this.iotService.getSensorStats(sensorId, days || 7);
  }

  @Get("latest")
  async getLatestReadings() {
    return this.iotService.getLatestReadings();
  }

  @Get("alerts")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager", "user")
  async getSensorAlerts() {
    return this.iotService.getSensorAlerts();
  }

  @Post("sensors/:sensorId/data")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async addSensorData(
    @Param("sensorId") sensorId: string,
    @Body() addSensorDataDto: AddSensorDataDto
  ) {
    return this.iotService.addSensorData(
      sensorId,
      addSensorDataDto.value,
      addSensorDataDto.metadata
    );
  }
}
