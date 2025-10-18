import type { AuthConfig, PatchTestsProps } from "./patch-one";
import { UserRoleName } from "$shared/models/auth";
import { Request } from "supertest";
import { Test } from "@nestjs/testing";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { JwtModule } from "@nestjs/jwt";
import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { HttpStatus } from "@nestjs/common";
import { WithOptional } from "$sharedSrc/utils/objects";
import { UserPayload } from "$sharedSrc/models/auth";
import { AppPayloadEncoderService } from "#core/auth/strategies/jwt/payload/AppPayloadEncoderService";
import { TestingSetup } from "#core/app/tests/app";
import { GenerateHttpCaseProps, logger } from "./generate-http-case";
import { generateHttpCase } from "./generate-http-case";

const { AUTH_JWT_SECRET } = process.env;

assertIsDefined(AUTH_JWT_SECRET);

type Props = {
  user: UserPayload | null;
  req: Request;
};
export async function setAuthRoleInCookie( { req, user }: Props) {
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

export function getFixtureUserByRole(role: UserRoleName): UserPayload | null {
  switch (role) {
    case UserRoleName.ADMIN:
      return fixtureUsers.Admin.UserWithRoles;
    case UserRoleName.USER:
      return fixtureUsers.Normal.UserWithRoles;
    case UserRoleName.GUEST:
      return null;
    case UserRoleName.UPLOADER:
      return null; // TODO
    default: neverCase(role);
  }
}

type AuthClassificationEntry = {
  user: UserPayload | null;
  name: string;
};
export function classifyAuth(auth?: AuthConfig) {
  const allowed: AuthClassificationEntry[] = [];
  const notAllowed: AuthClassificationEntry[] = [];

  if (auth) {
    if (auth?.roles) {
      for (const [k, v] of Object.entries(auth.roles)) {
        const entry = {
          user: getFixtureUserByRole(k as UserRoleName),
          name: `role=${k}`,
        } as AuthClassificationEntry;

        if (v)
          allowed.push(entry);
        else
          notAllowed.push(entry);
      }
    }
  } else {
    allowed.push( {
      user: null,
      name: "role=guest",
    } );
  }

  return {
    allowed,
    notAllowed,
  };
}

type PutUserProps = {
  getTestingSetup: ()=> TestingSetup;
  user: UserPayload | null;
  request: Request;
};
export async function putUser( { getTestingSetup, request, user }: PutUserProps) {
  const testingSetup = getTestingSetup();

  if (testingSetup.options?.auth?.cookies === "mock")
    await testingSetup.useMockedUser(user);
  else {
    await setAuthRoleInCookie( {
      user,
      req: request,
    } );
  }
}

type NotAllowedProps<R> =
  Pick<PatchTestsProps<R>, "afterEach" | "beforeEach" | "getTestingSetup">
    & WithOptional<GenerateHttpCaseProps, "name" | "response"> & {
  entry: AuthClassificationEntry;
};
export function generateNotAllowedTest<R>(props: NotAllowedProps<R>) {
  describe(`not allowed auth ${props.entry.name}`, () => {
    const beforeEach: typeof props.beforeEach = async (p) => {
      await putUser( {
        getTestingSetup: props.getTestingSetup,
        request: p.request,
        user: props.entry.user,
      } );

      return props.beforeEach?.(p);
    };

    generateHttpCase( {
      name: "invalid auth",
      request: {
        method: props.request.method,
        url: props.request.url,
      },
      before: beforeEach,
      after: props.afterEach,
      getExpressApp: props.getExpressApp,
      response: {
        statusCode: props.entry.user === null
          ? HttpStatus.UNAUTHORIZED
          : HttpStatus.FORBIDDEN,
      },
    } );
  } );
}
