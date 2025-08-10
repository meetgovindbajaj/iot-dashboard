"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const iot_service_1 = require("./iot.service");
const iot_controller_1 = require("./iot.controller");
const iot_resolver_1 = require("./iot.resolver");
const sensor_data_schema_1 = require("./sensor-data.schema");
const sensor_schema_1 = require("./sensor.schema");
const data_simulation_service_1 = require("./data-simulation.service");
let IotModule = class IotModule {
};
exports.IotModule = IotModule;
exports.IotModule = IotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: sensor_data_schema_1.SensorData.name, schema: sensor_data_schema_1.SensorDataSchema },
                { name: sensor_schema_1.Sensor.name, schema: sensor_schema_1.SensorSchema },
            ]),
        ],
        providers: [iot_service_1.IotService, iot_resolver_1.IotResolver, data_simulation_service_1.DataSimulationService],
        controllers: [iot_controller_1.IotController],
        exports: [iot_service_1.IotService, data_simulation_service_1.DataSimulationService],
    })
], IotModule);
//# sourceMappingURL=iot.module.js.map