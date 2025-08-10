import { OnModuleInit } from "@nestjs/common";
import { IotService } from "./iot.service";
export declare class DataSimulationService implements OnModuleInit {
    private iotService;
    private simulationIntervals;
    constructor(iotService: IotService);
    onModuleInit(): Promise<void>;
    startSimulation(): void;
    private generateTemperature;
    private generateHumidity;
    private generatePower;
    stopSimulation(): void;
}
