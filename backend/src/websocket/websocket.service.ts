import { Injectable } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";

@Injectable()
export class WebsocketService {
  constructor(private websocketGateway: WebsocketGateway) {}

  async notifySensorUpdate(sensorId: string) {
    await this.websocketGateway.broadcastSensorUpdate(sensorId);
  }

  async sendAlert(
    message: string,
    severity: "info" | "warning" | "error" = "info",
  ) {
    await this.websocketGateway.sendAlert(message, severity);
  }
}
