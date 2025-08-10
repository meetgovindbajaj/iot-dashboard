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
exports.IotResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const iot_service_1 = require("./iot.service");
const sensor_schema_1 = require("./sensor.schema");
const sensor_data_schema_1 = require("./sensor-data.schema");
let IotResolver = class IotResolver {
    iotService;
    constructor(iotService) {
        this.iotService = iotService;
    }
    async sensors() {
        return this.iotService.getAllSensors();
    }
    async sensor(sensorId) {
        return this.iotService.getSensorById(sensorId);
    }
    async sensorData(sensorId, limit) {
        return this.iotService.getSensorData(sensorId, limit);
    }
    async historicalData(sensorId, startDate, endDate) {
        return this.iotService.getHistoricalData(sensorId, startDate, endDate);
    }
};
exports.IotResolver = IotResolver;
__decorate([
    (0, graphql_1.Query)(() => [sensor_schema_1.Sensor]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IotResolver.prototype, "sensors", null);
__decorate([
    (0, graphql_1.Query)(() => sensor_schema_1.Sensor, { nullable: true }),
    __param(0, (0, graphql_1.Args)("sensorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IotResolver.prototype, "sensor", null);
__decorate([
    (0, graphql_1.Query)(() => [sensor_data_schema_1.SensorData]),
    __param(0, (0, graphql_1.Args)("sensorId")),
    __param(1, (0, graphql_1.Args)("limit", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], IotResolver.prototype, "sensorData", null);
__decorate([
    (0, graphql_1.Query)(() => [sensor_data_schema_1.SensorData]),
    __param(0, (0, graphql_1.Args)("sensorId")),
    __param(1, (0, graphql_1.Args)("startDate")),
    __param(2, (0, graphql_1.Args)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], IotResolver.prototype, "historicalData", null);
exports.IotResolver = IotResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [iot_service_1.IotService])
], IotResolver);
//# sourceMappingURL=iot.resolver.js.map