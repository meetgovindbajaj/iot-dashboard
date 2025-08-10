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
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const iot_service_1 = require("../iot/iot.service");
let WebsocketGateway = class WebsocketGateway {
    iotService;
    server;
    logger = new common_1.Logger("WebSocketGateway");
    connectedClients = new Map();
    broadcastInterval;
    constructor(iotService) {
        this.iotService = iotService;
    }
    afterInit(server) {
        this.logger.log("🔌 WebSocket Gateway initialized");
        this.startDataBroadcast();
    }
    handleConnection(client) {
        this.logger.log(`👤 Client connected: ${client.id}`);
        this.connectedClients.set(client.id, client);
        this.sendLatestDataToClient(client);
    }
    handleDisconnect(client) {
        this.logger.log(`👋 Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    handleJoinRoom(client, room) {
        client.join(room);
        this.logger.log(`📍 Client ${client.id} joined room: ${room}`);
    }
    handleLeaveRoom(client, room) {
        client.leave(room);
        this.logger.log(`🚪 Client ${client.id} left room: ${room}`);
    }
    async handleRequestSensorData(client, sensorId) {
        try {
            const sensorData = await this.iotService.getSensorData(sensorId, 50);
            client.emit("sensorDataResponse", {
                sensorId,
                data: sensorData,
            });
        }
        catch (error) {
            client.emit("error", { message: "Failed to fetch sensor data" });
        }
    }
    async sendLatestDataToClient(client) {
        try {
            const latestReadings = await this.iotService.getLatestReadings();
            client.emit("latestReadings", latestReadings);
        }
        catch (error) {
            this.logger.error("Error sending latest data to client:", error);
        }
    }
    startDataBroadcast() {
        this.broadcastInterval = setInterval(async () => {
            if (this.connectedClients.size > 0) {
                try {
                    const latestReadings = await this.iotService.getLatestReadings();
                    this.server.emit("latestReadings", latestReadings);
                    latestReadings.forEach((reading) => {
                        if (reading.data) {
                            this.server.emit("sensorUpdate", {
                                sensorId: reading.sensor.sensorId,
                                sensorName: reading.sensor.name,
                                sensorType: reading.sensor.type,
                                value: reading.data.value,
                                unit: reading.sensor.unit,
                                timestamp: reading.data.timestamp,
                                location: reading.sensor.location,
                            });
                        }
                    });
                }
                catch (error) {
                    this.logger.error("Error broadcasting data:", error);
                }
            }
        }, 5000);
    }
    async broadcastSensorUpdate(sensorId) {
        try {
            const sensor = await this.iotService.getSensorById(sensorId);
            const latestData = await this.iotService.getSensorData(sensorId, 1);
            if (sensor && latestData.length > 0) {
                this.server.emit("sensorUpdate", {
                    sensorId: sensor.sensorId,
                    sensorName: sensor.name,
                    sensorType: sensor.type,
                    value: latestData[0].value,
                    unit: sensor.unit,
                    timestamp: latestData[0].timestamp,
                    location: sensor.location,
                });
            }
        }
        catch (error) {
            this.logger.error("Error broadcasting sensor update:", error);
        }
    }
    async sendAlert(message, severity = "info") {
        this.server.emit("alert", {
            message,
            severity,
            timestamp: new Date(),
        });
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("joinRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leaveRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("requestSensorData"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleRequestSensorData", null);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [iot_service_1.IotService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map