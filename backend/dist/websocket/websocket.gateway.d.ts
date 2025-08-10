import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { IotService } from "../iot/iot.service";
export declare class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private iotService;
    server: Server;
    private logger;
    private connectedClients;
    private broadcastInterval;
    constructor(iotService: IotService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, room: string): void;
    handleLeaveRoom(client: Socket, room: string): void;
    handleRequestSensorData(client: Socket, sensorId: string): Promise<void>;
    private sendLatestDataToClient;
    private startDataBroadcast;
    broadcastSensorUpdate(sensorId: string): Promise<void>;
    sendAlert(message: string, severity?: "info" | "warning" | "error"): Promise<void>;
}
