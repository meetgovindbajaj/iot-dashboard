import { Module } from "@nestjs/common";
import { IotModule } from "../iot/iot.module";
import { WebsocketGateway } from "./websocket.gateway";

@Module({
  imports: [IotModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
