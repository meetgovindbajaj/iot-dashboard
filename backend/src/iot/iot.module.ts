import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IotService } from "./iot.service";
import { IotController } from "./iot.controller";
import { IotResolver } from "./iot.resolver";
import { SensorData, SensorDataSchema } from "./sensor-data.schema";
import { Sensor, SensorSchema } from "./sensor.schema";
import { DataSimulationService } from "./data-simulation.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SensorData.name, schema: SensorDataSchema },
      { name: Sensor.name, schema: SensorSchema },
    ]),
  ],
  providers: [IotService, IotResolver, DataSimulationService],
  controllers: [IotController],
  exports: [IotService, DataSimulationService],
})
export class IotModule {}
