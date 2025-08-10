import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { IotService } from "./iot.service";

@Controller("iot")
@UseGuards(JwtAuthGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get("sensors")
  async getAllSensors() {
    return this.iotService.getAllSensors();
  }

  @Get("sensors/:sensorId")
  async getSensorById(@Param("sensorId") sensorId: string) {
    return this.iotService.getSensorById(sensorId);
  }

  @Get("sensors/:sensorId/data")
  async getSensorData(
    @Param("sensorId") sensorId: string,
    @Query("limit") limit?: number,
  ) {
    return this.iotService.getSensorData(sensorId, limit || 100);
  }

  @Get("sensors/:sensorId/history")
  async getHistoricalData(
    @Param("sensorId") sensorId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.iotService.getHistoricalData(sensorId, start, end);
  }

  @Get("latest")
  async getLatestReadings() {
    return this.iotService.getLatestReadings();
  }

  @Post("sensors/:sensorId/data")
  async addSensorData(
    @Param("sensorId") sensorId: string,
    @Body() body: { value: number; metadata?: string },
  ) {
    return this.iotService.addSensorData(sensorId, body.value, body.metadata);
  }
}
