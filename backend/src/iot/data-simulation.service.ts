import { Injectable, OnModuleInit } from "@nestjs/common";
import { IotService } from "./iot.service";

@Injectable()
export class DataSimulationService implements OnModuleInit {
  private simulationIntervals: NodeJS.Timeout[] = [];

  constructor(private iotService: IotService) {}

  async onModuleInit() {
    // Start data simulation after a short delay
    setTimeout(() => {
      this.startSimulation();
    }, 5000);
  }

  startSimulation() {
    console.log("🌡️ Starting IoT data simulation...");

    // Simulate temperature sensors (18-30°C range)
    this.simulationIntervals.push(
      setInterval(async () => {
        await this.iotService.addSensorData(
          "TEMP_001",
          this.generateTemperature(20, 25) // Server room - cooler
        );
        await this.iotService.addSensorData(
          "TEMP_002",
          this.generateTemperature(22, 28) // Office - warmer
        );
      }, 5000)
    );

    // Simulate humidity sensors (30-70% range)
    this.simulationIntervals.push(
      setInterval(async () => {
        await this.iotService.addSensorData(
          "HUM_001",
          this.generateHumidity(35, 55) // Server room - controlled
        );
        await this.iotService.addSensorData(
          "HUM_002",
          this.generateHumidity(40, 65) // Office - variable
        );
      }, 7000)
    );

    // Simulate power sensors (1-20 kW range)
    this.simulationIntervals.push(
      setInterval(async () => {
        await this.iotService.addSensorData(
          "POW_001",
          this.generatePower(8, 15) // Main panel
        );
        await this.iotService.addSensorData(
          "POW_002",
          this.generatePower(2, 8) // UPS system
        );
      }, 3000)
    );

    // Simulate pressure sensors (900-1100 hPa range)
    this.simulationIntervals.push(
      setInterval(async () => {
        await this.iotService.addSensorData(
          "PRESSURE_001",
          this.generatePressure(980, 1020) // HVAC pressure
        );
      }, 8000)
    );
  }

  private generateTemperature(min: number, max: number): number {
    // Add some realistic temperature variation
    const base = min + Math.random() * (max - min);
    const noise = (Math.random() - 0.5) * 2; // ±1°C noise
    return Math.round((base + noise) * 10) / 10;
  }

  private generateHumidity(min: number, max: number): number {
    // Add humidity variation
    const base = min + Math.random() * (max - min);
    const noise = (Math.random() - 0.5) * 4; // ±2% noise
    return Math.round((base + noise) * 10) / 10;
  }

  private generatePower(min: number, max: number): number {
    // Power consumption with some spikes
    const base = min + Math.random() * (max - min);
    const spike = Math.random() > 0.9 ? Math.random() * 3 : 0; // 10% chance of spike
    return Math.round((base + spike) * 100) / 100;
  }

  private generatePressure(min: number, max: number): number {
    // Atmospheric pressure with gradual changes
    const base = min + Math.random() * (max - min);
    const noise = (Math.random() - 0.5) * 10; // ±5 hPa noise
    return Math.round((base + noise) * 10) / 10;
  }

  stopSimulation() {
    this.simulationIntervals.forEach((interval) => clearInterval(interval));
    this.simulationIntervals = [];
    console.log("⏹️ IoT data simulation stopped");
  }
}
