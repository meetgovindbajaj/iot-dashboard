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
exports.IotController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const iot_service_1 = require("./iot.service");
let IotController = class IotController {
    iotService;
    constructor(iotService) {
        this.iotService = iotService;
    }
    async getAllSensors() {
        return this.iotService.getAllSensors();
    }
    async getSensorById(sensorId) {
        return this.iotService.getSensorById(sensorId);
    }
    async getSensorData(sensorId, limit) {
        return this.iotService.getSensorData(sensorId, limit || 100);
    }
    async getHistoricalData(sensorId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.iotService.getHistoricalData(sensorId, start, end);
    }
    async getLatestReadings() {
        return this.iotService.getLatestReadings();
    }
    async addSensorData(sensorId, body) {
        return this.iotService.addSensorData(sensorId, body.value, body.metadata);
    }
};
exports.IotController = IotController;
__decorate([
    (0, common_1.Get)("sensors"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IotController.prototype, "getAllSensors", null);
__decorate([
    (0, common_1.Get)("sensors/:sensorId"),
    __param(0, (0, common_1.Param)("sensorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IotController.prototype, "getSensorById", null);
__decorate([
    (0, common_1.Get)("sensors/:sensorId/data"),
    __param(0, (0, common_1.Param)("sensorId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], IotController.prototype, "getSensorData", null);
__decorate([
    (0, common_1.Get)("sensors/:sensorId/history"),
    __param(0, (0, common_1.Param)("sensorId")),
    __param(1, (0, common_1.Query)("startDate")),
    __param(2, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IotController.prototype, "getHistoricalData", null);
__decorate([
    (0, common_1.Get)("latest"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IotController.prototype, "getLatestReadings", null);
__decorate([
    (0, common_1.Post)("sensors/:sensorId/data"),
    __param(0, (0, common_1.Param)("sensorId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IotController.prototype, "addSensorData", null);
exports.IotController = IotController = __decorate([
    (0, common_1.Controller)("iot"),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [iot_service_1.IotService])
], IotController);
//# sourceMappingURL=iot.controller.js.map