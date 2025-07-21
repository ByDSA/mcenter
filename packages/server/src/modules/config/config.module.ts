import { Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";

@Module( {
  imports: [],
  controllers: [ConfigController],
} )
export class ConfigModule {}
