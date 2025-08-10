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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sensor_schema_1 = require("./sensor.schema");
const sensor_data_schema_1 = require("./sensor-data.schema");
let IotService = class IotService {
    sensorModel;
    sensorDataModel;
    constructor(sensorModel, sensorDataModel) {
        this.sensorModel = sensorModel;
        this.sensorDataModel = sensorDataModel;
    }
    async onModuleInit() {
        await this.initializeSensors();
    }
    async initializeSensors() {
        const existingSensors = await this.sensorModel.countDocuments();
        if (existingSensors === 0) {
            const defaultSensors = [
                {
                    sensorId: "TEMP_001",
                    name: "Temperature Sensor 1",
                    type: "temperature",
                    location: "Server Room",
                    unit: "°C",
                },
                {
                    sensorId: "TEMP_002",
                    name: "Temperature Sensor 2",
                    type: "temperature",
                    location: "Office Area",
                    unit: "°C",
                },
                {
                    sensorId: "HUM_001",
                    name: "Humidity Sensor 1",
                    type: "humidity",
                    location: "Server Room",
                    unit: "%",
                },
                {
                    sensorId: "HUM_002",
                    name: "Humidity Sensor 2",
                    type: "humidity",
                    location: "Office Area",
                    unit: "%",
                },
                {
                    sensorId: "POW_001",
                    name: "Power Monitor 1",
                    type: "power",
                    location: "Main Panel",
                    unit: "kW",
                },
                {
                    sensorId: "POW_002",
                    name: "Power Monitor 2",
                    type: "power",
                    location: "UPS System",
                    unit: "kW",
                },
            ];
            await this.sensorModel.insertMany(defaultSensors);
            console.log("🔧 Default sensors initialized");
        }
    }
    async getAllSensors() {
        return this.sensorModel.find({ isActive: true }).exec();
    }
    async getSensorById(sensorId) {
        return this.sensorModel.findOne({ sensorId, isActive: true }).exec();
    }
    async addSensorData(sensorId, value, metadata) {
        const sensorData = new this.sensorDataModel({
            sensorId,
            value,
            metadata,
            timestamp: new Date(),
        });
        const savedData = await sensorData.save();
        await this.sensorModel.updateOne({ sensorId }, { lastUpdated: new Date() });
        return savedData;
    }
    async getSensorData(sensorId, limit = 100) {
        return this.sensorDataModel
            .find({ sensorId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }
    async getHistoricalData(sensorId, startDate, endDate) {
        return this.sensorDataModel
            .find({
            sensorId,
            timestamp: { $gte: startDate, $lte: endDate },
        })
            .sort({ timestamp: 1 })
            .exec();
    }
    async getLatestReadings() {
        const sensors = await this.getAllSensors();
        const readings = [];
        for (const sensor of sensors) {
            const latestData = await this.sensorDataModel
                .findOne({ sensorId: sensor.sensorId })
                .sort({ timestamp: -1 })
                .exec();
            readings.push({
                sensor,
                data: latestData,
            });
        }
        return readings;
    }
};
exports.IotService = IotService;
exports.IotService = IotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sensor_schema_1.Sensor.name)),
    __param(1, (0, mongoose_1.InjectModel)(sensor_data_schema_1.SensorData.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], IotService);
//# sourceMappingURL=iot.service.js.map