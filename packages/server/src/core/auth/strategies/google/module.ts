import { Module } from "@nestjs/common";
import { UsersModule } from "../../users/module";
import { AuthModule } from "../jwt";
import { GoogleController } from "./controller";
import { AuthGoogleService } from "./service";
import { GoogleStrategy } from "./strategy";

@Module( {
  imports: [UsersModule, AuthModule],
  controllers: [GoogleController],
  providers: [AuthGoogleService, GoogleStrategy],
  exports: [AuthGoogleService],
} )
export class AuthGoogleModule {}
