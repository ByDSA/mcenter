import { HttpStatus } from "@nestjs/common";
import { Application } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { UserRoleName } from "$shared/models/auth";
import { assertFoundClient } from "#utils/validation/found";
import { AfterProps, BeforeProps, ExpectedBody, generateCase, GenerateCaseProps } from "./generate-case";
import { defaultResponse, expectedDataNotFound, expectUnprocessableEntity } from "./common";
import { setAuthRole } from "./auth";

type MockFn = NonNullable<GenerateCaseProps["mock"]>["fn"][0];
export type PatchTestsProps<R> = {
  repo: Omit<MockFn, "getFn"> & {
    getRepo: ()=> R;
    getFn: (repo: R)=> ReturnType<MockFn["getFn"]>;
  };
  getExpressApp: ()=> Application;
  url?: string;
  data?: {
    validInput?: object;
    invalidInput?: object;
  };
  auth?: Record<UserRoleName, boolean>;
  beforeEach?: (props: BeforeProps)=> Promise<void>;
  afterEach?: (props: AfterProps)=> Promise<void>;
  expectBody?: (body: unknown, repoReturned?: Awaited<MockFn["returned"]>)=> void;
  expectedBody?: ExpectedBody;
  customCases?: ((props: PatchTestsProps<R>)=> GenerateCaseProps)[];
};

function defaultProps<R>(props: PatchTestsProps<R>) {
  const { getFn, invalidInput, repoReturned, validInput } = autoProps(props);
  const { expectedBody, shouldReturn } = defaultResponse(props);

  return {
    expectedBody,
    getFn,
    invalidInput,
    repoReturned,
    shouldReturn,
    validInput,
  };
}

export function autoProps<R>(props: PatchTestsProps<R>) {
  const repoReturned = props.repo.returned;
  const getFn = ()=>props.repo.getFn(props.repo.getRepo());
  const invalidInput = props.data?.invalidInput ?? {
    cosaRara: "new title",
  };
  const validInput = props.data?.validInput ?? props.repo.params?.[1];

  return {
    repoReturned,
    getFn,
    invalidInput,
    validInput,
  };
}

export function patchOneTests<R>(
  props: PatchTestsProps<R>,
) {
  const { repo,
    getExpressApp } = props;
  const { expectedBody, getFn,
    repoReturned, shouldReturn,
    invalidInput, validInput } = defaultProps(props);
  const validUrl = props.url ?? "/id";

  assertIsDefined(validInput, "validInput must be defined in patch tests");
  assertIsDefined(repo.params, "repoParams must be defined in patch tests");

  describe("patch one", () => {
    const { auth } = props;
    const positiveAuth = auth
      ? Object.entries(auth).filter(([, v])=> v)
        .map(([k])=> k as UserRoleName)
      : undefined;
    const negativeAuth = auth
      ? Object.entries(auth).filter(([, v])=> !v)
        .map(([k])=> k as UserRoleName)
      : undefined;

    for (const role of positiveAuth ?? [null]) {
      const rolePrefix = `${role ? `role=${role} ` : ""}`;
      const beforeEach: typeof props.beforeEach = role
        ? async (p) => {
          await setAuthRole( {
            role,
            req: p.request,
          } );

          return props.beforeEach?.(p);
        }
        : props.beforeEach;

      generateCase( {
        name: `${rolePrefix}valid case`,
        method: "patch",
        body: validInput,
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: {
          expectBody: props.expectBody
            ? (body: unknown) => props.expectBody!(body, repoReturned)
            : undefined,
          body: expectedBody,
          statusCode: shouldReturn ? HttpStatus.OK : HttpStatus.NO_CONTENT,
        },
        mock: {
          fn: [{
            ...repo,
            getFn,
            returned: shouldReturn ? repoReturned : undefined,
          }],
        },
      } );

      generateCase( {
        name: `${rolePrefix}invalid input case`,
        method: "patch",
        body: invalidInput,
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: {
          expectBody: expectUnprocessableEntity,
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        },
      } );

      generateCase( {
        name: `${rolePrefix}not found case`,
        method: "patch",
        body: validInput,
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: expectedDataNotFound,
        mock: {
          fn: [{
            ...repo,
            getFn,
            returned: undefined,
            implementation: ()=> {
              assertFoundClient(undefined);
            },
          }],
        },
      } );
    }

    for (const role of negativeAuth ?? []) {
      const rolePrefix = `${role ? `role=${role} ` : ""}`;
      const beforeEach: typeof props.beforeEach = async (p) => {
        await setAuthRole( {
          role,
          req: p.request,
        } );

        return props.beforeEach?.(p);
      };

      generateCase( {
        name: `${rolePrefix}invalid auth`,
        method: "patch",
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: {
          expectBody: ()=>undefined, // any body
          statusCode: HttpStatus.FORBIDDEN,
        },
      } );
    }
  } );
}
