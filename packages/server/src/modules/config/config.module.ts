import { Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";
import { StaticFilesModule } from "./static-files.module";

@Module( {
  imports: [StaticFilesModule],
  controllers: [ConfigController],
} )
export class ConfigModule {}
