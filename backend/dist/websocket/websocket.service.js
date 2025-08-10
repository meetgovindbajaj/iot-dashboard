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
exports.WebsocketService = void 0;
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("./websocket.gateway");
let WebsocketService = class WebsocketService {
    websocketGateway;
    constructor(websocketGateway) {
        this.websocketGateway = websocketGateway;
    }
    async notifySensorUpdate(sensorId) {
        await this.websocketGateway.broadcastSensorUpdate(sensorId);
    }
    async sendAlert(message, severity = "info") {
        await this.websocketGateway.sendAlert(message, severity);
    }
};
exports.WebsocketService = WebsocketService;
exports.WebsocketService = WebsocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [websocket_gateway_1.WebsocketGateway])
], WebsocketService);
//# sourceMappingURL=websocket.service.js.map