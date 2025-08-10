import { Resolver, Query, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { IotService } from "./iot.service";
import { Sensor } from "./sensor.schema";
import { SensorData } from "./sensor-data.schema";

@Resolver()
@UseGuards(JwtAuthGuard)
export class IotResolver {
  constructor(private iotService: IotService) {}

  @Query(() => [Sensor])
  async sensors(): Promise<Sensor[]> {
    return this.iotService.getAllSensors();
  }

  @Query(() => Sensor, { nullable: true })
  async sensor(@Args("sensorId") sensorId: string): Promise<Sensor | null> {
    return this.iotService.getSensorById(sensorId);
  }

  @Query(() => [SensorData])
  async sensorData(
    @Args("sensorId") sensorId: string,
    @Args("limit", { nullable: true }) limit?: number,
  ): Promise<SensorData[]> {
    return this.iotService.getSensorData(sensorId, limit);
  }

  @Query(() => [SensorData])
  async historicalData(
    @Args("sensorId") sensorId: string,
    @Args("startDate") startDate: Date,
    @Args("endDate") endDate: Date,
  ): Promise<SensorData[]> {
    return this.iotService.getHistoricalData(sensorId, startDate, endDate);
  }
}
