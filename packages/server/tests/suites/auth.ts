import { UserEntityWithRoles, UserRoleName } from "$shared/models/auth";
import { Request } from "supertest";
import { Test } from "@nestjs/testing";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { JwtModule } from "@nestjs/jwt";
import { assertIsDefined } from "$shared/utils/validation";
import { AppPayloadEncoderService } from "#core/auth/strategies/jwt/payload/AppPayloadEncoderService";
import { logger } from "./generate-case";

const { AUTH_JWT_SECRET } = process.env;

assertIsDefined(AUTH_JWT_SECRET);

type Props = {
  role: UserRoleName;
  req: Request;
};
export async function setAuthRole( { req, role }: Props) {
  const moduleBuilder = Test.createTestingModule( {
    imports: [JwtModule.register( {
      secret: AUTH_JWT_SECRET,
      signOptions: {
        expiresIn: 3600,
      },
    } )],
    providers: [
      AppPayloadEncoderService,
    ],
  } ).setLogger(logger);
  const module = await moduleBuilder.compile();
  const service = await module.resolve<AppPayloadEncoderService>(AppPayloadEncoderService);
  let user: UserEntityWithRoles;

  if (role === UserRoleName.ADMIN) {
    user = {
      ...fixtureUsers.Admin.User,
      roles: fixtureUsers.Admin.Roles,
    };
  } else {
    user = {
      ...fixtureUsers.Normal.User,
      roles: fixtureUsers.Normal.Roles,
    };
  }

  const authCookieObj = {
    user,
  };
  const authCookieValue = service.sign(authCookieObj);
  const cookieTxt = `${process.env.AUTH_COOKIE_NAME}=${authCookieValue}`;

  logger.debug(
    `Putting cookie: ${JSON.stringify(authCookieObj, null, 2)}"`,
  );
  req.set("Cookie", [cookieTxt]);
}
