import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { assertIsDefined } from "$shared/utils/validation";
import { MailsModule } from "#core/mails/module";
import { UsersModule } from "./users/module";
import { AppPayloadService } from "./strategies/jwt/payload/AppPayloadService";
import { JwtStrategy } from "./strategies/jwt/strategy";
import { AuthPassController } from "./strategies/local/controller";
import { AuthLocalService } from "./strategies/local/service";
import { LocalStrategy } from "./strategies/local/strategy";
import { UserPassesRepository } from "./strategies/local/user-pass";
import { AuthGoogleService } from "./strategies/google/service";
import { GoogleStrategy } from "./strategies/google/strategy";
import { AuthController } from "./controller";
import { LocalUserVerificationService } from "./strategies/local/verification.service";

const { AUTH_JWT_SECRET } = process.env;

assertIsDefined(AUTH_JWT_SECRET);

@Module( {
  imports: [
    PassportModule.register( {
      defaultStrategy: "jwt",
    } ),
    JwtModule.register( {
      secret: AUTH_JWT_SECRET,
      signOptions: {
        expiresIn: 3600,
      },
    } ),
    UsersModule,
    MailsModule,
  ],
  controllers: [AuthController, AuthPassController],
  providers: [
    AppPayloadService,
    JwtStrategy,
    // Local
    UserPassesRepository,
    LocalUserVerificationService,
    AuthLocalService,
    LocalStrategy,
    // Google
    AuthGoogleService,
    GoogleStrategy,
  ],
  exports: [AppPayloadService],
} )
export class AuthModule {}
