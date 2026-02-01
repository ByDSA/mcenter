import { HttpStatus } from "@nestjs/common";
import { Application } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { UserPayload, UserRoleName } from "$shared/models/auth";
import { assertFoundClient } from "#utils/validation/found";
import { TestingSetup } from "#core/app/tests/app";
import { mockMongoId } from "#tests/mongo";
import { AfterProps, BeforeProps, GenerateHttpCaseProps } from "./generate-http-case";
import { defaultResponse, expectedDataNotFound, expectUnprocessableEntity } from "./common";
import { classifyAuth, generateNotAllowedTest, putUser } from "./auth";
import { generateHttpCase, MockConfig } from "./generate-http-case";

export type AuthConfig = {
  roles?: Partial<Record<UserRoleName, boolean>>;
};

export type BeforeExecutionConfig<R> = {
  beforeExecution: BeforeExecutionFn<R>;
};

export type TestGroupConfigCtx = {
  authUser: UserPayload | null;
};
type BeforeExecution<R> = {
  repo: R;
};
type BeforeExecutionFn<R> = ()=> BeforeExecution<R>;

export type TestDynamicConfig = {
    mockConfig: MockConfig<any>;
};

export type TestGroupFullConfig<R> = {
  dynamicConfig: TestDynamicConfig;
  ctx: TestGroupConfigCtx;
  beforeExecution: BeforeExecutionFn<R>;
};

export type PatchTestsProps<R> = {
  getExpressApp: ()=> Application;
  getTestingSetup: ()=> TestingSetup;
  buildDynamicConfig: (ctx: TestGroupConfigCtx)=> TestDynamicConfig;
  beforeExecution: BeforeExecutionFn<R>;
  url?: string;
  data?: {
    validInput?: object;
    invalidInput?: object;
  };
  auth?: AuthConfig;
  beforeEach?: (props: BeforeProps)=> Promise<void>;
  afterEach?: (props: AfterProps)=> Promise<void>;
  expectBody?: (body: object, ctx?: TestGroupFullConfig<R>)=> void;
  customCases?: ((props: PatchTestsProps<R>)=> GenerateHttpCaseProps)[];
};

function defaultProps<R>(
  config: TestDynamicConfig,
  props: PatchTestsProps<R>,
) {
  const { invalidInput, validInput } = autoProps(config, props.data);
  const { expectBody, shouldReturn } = defaultResponse(config, props.expectBody);

  return {
    expectBody,
    invalidInput,
    shouldReturn,
    validInput,
  };
}

export function autoProps<R>(
  config: TestDynamicConfig,
  data: PatchTestsProps<R>["data"],
) {
  const invalidInput = data?.invalidInput ?? {
    cosaRara: "new title",
  };
  const validInput = data?.validInput ?? config.mockConfig.expected?.params?.[1];

  return {
    invalidInput,
    validInput,
  };
}

export function patchOneTests<R>(
  props: PatchTestsProps<R>,
) {
  const { buildDynamicConfig, getExpressApp, getTestingSetup } = props;
  const validUrl = props.url ?? "/" + mockMongoId;

  describe("patch one", () => {
    const { allowed, notAllowed } = classifyAuth(props.auth);

    for (const entry of allowed) {
      const { user } = entry;

      describe(`allowed auth ${entry.name}`, () => {
        const ctx: TestGroupConfigCtx = {
          authUser: user,
        };
        const dynamicConfig = buildDynamicConfig(ctx);
        const { expectBody, shouldReturn,
          invalidInput, validInput } = defaultProps(dynamicConfig, props);

        assertIsDefined(validInput, "validInput must be defined in patch tests");
        assertIsDefined(
          dynamicConfig.mockConfig.expected?.params,
          "mockConfig.expected.params must be defined in patch tests",
        );
        const beforeEach: typeof props.beforeEach = async (p) => {
          await putUser( {
            getTestingSetup,
            request: p.request,
            user,
          } );

          return props.beforeEach?.(p);
        };

        generateHttpCase( {
          name: "valid case",
          request: {
            method: "patch",
            body: validInput,
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: {
            body: expectBody
              ? (body)=> {
                expectBody(body, {
                  ctx,
                  dynamicConfig,
                  beforeExecution: props.beforeExecution,
                } );
              }
              : undefined,
            statusCode: shouldReturn ? HttpStatus.OK : HttpStatus.NO_CONTENT,
          },
          mockConfigs: [{
            ...dynamicConfig.mockConfig,
            returned: shouldReturn ? dynamicConfig.mockConfig.returned : undefined,
          }],
        } );

        generateHttpCase( {
          name: "invalid input case",
          request: {
            method: "patch",
            body: invalidInput,
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: {
            body: expectUnprocessableEntity,
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          },
        } );

        generateHttpCase( {
          name: "not found case",
          request: {
            method: "patch",
            body: validInput,
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: expectedDataNotFound,
          mockConfigs: [{
            ...dynamicConfig.mockConfig,
            returned: undefined,
            implementation: ()=> {
              assertFoundClient(undefined);
            },
          }],
        } );
      } );
    }

    for (const entry of notAllowed) {
      generateNotAllowedTest( {
        getExpressApp,
        getTestingSetup,
        request: {
          method: "patch",
          url: validUrl,
        },
        entry,
        after: props.afterEach,
        before: props.beforeEach,
      } );
    }
  } );
}
