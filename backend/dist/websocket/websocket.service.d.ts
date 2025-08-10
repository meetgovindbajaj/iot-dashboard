import { WebsocketGateway } from "./websocket.gateway";
export declare class WebsocketService {
    private websocketGateway;
    constructor(websocketGateway: WebsocketGateway);
    notifySensorUpdate(sensorId: string): Promise<void>;
    sendAlert(message: string, severity?: "info" | "warning" | "error"): Promise<void>;
}
