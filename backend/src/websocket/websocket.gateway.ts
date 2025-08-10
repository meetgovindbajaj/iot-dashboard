import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { IotService } from "../iot/iot.service";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger("WebSocketGateway");
  private connectedClients: Map<string, Socket> = new Map();
  private broadcastInterval: NodeJS.Timeout;

  constructor(private iotService: IotService) {}

  afterInit(server: Server) {
    this.logger.log("🔌 WebSocket Gateway initialized");
    this.startDataBroadcast();
  }

  handleConnection(client: Socket) {
    this.logger.log(`👤 Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send initial data to new client
    this.sendLatestDataToClient(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`👋 Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`📍 Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage("leaveRoom")
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`🚪 Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage("requestSensorData")
  async handleRequestSensorData(client: Socket, sensorId: string) {
    try {
      const sensorData = await this.iotService.getSensorData(sensorId, 50);
      client.emit("sensorDataResponse", {
        sensorId,
        data: sensorData,
      });
    } catch (error) {
      client.emit("error", { message: "Failed to fetch sensor data" });
    }
  }

  private async sendLatestDataToClient(client: Socket) {
    try {
      const latestReadings = await this.iotService.getLatestReadings();
      client.emit("latestReadings", latestReadings);
    } catch (error) {
      this.logger.error("Error sending latest data to client:", error);
    }
  }

  private startDataBroadcast() {
    // Broadcast latest readings every 5 seconds
    this.broadcastInterval = setInterval(async () => {
      if (this.connectedClients.size > 0) {
        try {
          const latestReadings = await this.iotService.getLatestReadings();
          this.server.emit("latestReadings", latestReadings);

          // Also emit individual sensor updates
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
        } catch (error) {
          this.logger.error("Error broadcasting data:", error);
        }
      }
    }, 5000);
  }

  // Method to manually broadcast new sensor data
  async broadcastSensorUpdate(sensorId: string) {
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
    } catch (error) {
      this.logger.error("Error broadcasting sensor update:", error);
    }
  }

  // Alert system for threshold violations
  async sendAlert(
    message: string,
    severity: "info" | "warning" | "error" = "info",
  ) {
    this.server.emit("alert", {
      message,
      severity,
      timestamp: new Date(),
    });
  }
}
