import { Module } from "@nestjs/common";
import { DatabaseModule } from "#core/db/module";
import { UsersModule } from "#core/auth/users";
import { AuthModule } from "#core/auth/strategies/jwt";
import { AuthGoogleModule } from "#core/auth/strategies/google";
import { DevController } from "./dev.controller";

@Module( {
  imports: [DatabaseModule, UsersModule, AuthModule, AuthGoogleModule],
  controllers: [DevController],
} )
export class DevModule {
}
