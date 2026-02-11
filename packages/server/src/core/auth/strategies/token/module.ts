import { Module } from "@nestjs/common";
import { UsersModule } from "#core/auth/users";
import { TokenStrategy } from "./strategy";

@Module( {
  imports: [UsersModule],
  controllers: [],
  providers: [
    TokenStrategy,
  ],
  exports: [],
} )
export class TokenAuthModule {}
