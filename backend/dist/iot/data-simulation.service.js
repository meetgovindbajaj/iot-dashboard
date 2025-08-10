"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSimulationService = void 0;
const common_1 = require("@nestjs/common");
const iot_service_1 = require("./iot.service");
let DataSimulationService = class DataSimulationService {
    iotService;
    simulationIntervals = [];
    constructor(iotService) {
        this.iotService = iotService;
    }
    async onModuleInit() {
        setTimeout(() => {
            this.startSimulation();
        }, 5000);
    }
    startSimulation() {
        console.log("🌡️ Starting IoT data simulation...");
        this.simulationIntervals.push(setInterval(async () => {
            await this.iotService.addSensorData("TEMP_001", this.generateTemperature(20, 25));
            await this.iotService.addSensorData("TEMP_002", this.generateTemperature(22, 28));
        }, 5000));
        this.simulationIntervals.push(setInterval(async () => {
            await this.iotService.addSensorData("HUM_001", this.generateHumidity(35, 55));
            await this.iotService.addSensorData("HUM_002", this.generateHumidity(40, 65));
        }, 7000));
        this.simulationIntervals.push(setInterval(async () => {
            await this.iotService.addSensorData("POW_001", this.generatePower(8, 15));
            await this.iotService.addSensorData("POW_002", this.generatePower(2, 8));
        }, 3000));
    }
    generateTemperature(min, max) {
        const base = min + Math.random() * (max - min);
        const noise = (Math.random() - 0.5) * 2;
        return Math.round((base + noise) * 10) / 10;
    }
    generateHumidity(min, max) {
        const base = min + Math.random() * (max - min);
        const noise = (Math.random() - 0.5) * 4;
        return Math.round((base + noise) * 10) / 10;
    }
    generatePower(min, max) {
        const base = min + Math.random() * (max - min);
        const spike = Math.random() > 0.9 ? Math.random() * 3 : 0;
        return Math.round((base + spike) * 100) / 100;
    }
    stopSimulation() {
        this.simulationIntervals.forEach((interval) => clearInterval(interval));
        this.simulationIntervals = [];
        console.log("⏹️ IoT data simulation stopped");
    }
};
exports.DataSimulationService = DataSimulationService;
exports.DataSimulationService = DataSimulationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [iot_service_1.IotService])
], DataSimulationService);
//# sourceMappingURL=data-simulation.service.js.map