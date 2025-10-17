import { HttpStatus } from "@nestjs/common";
import { TestGroupConfigCtx, PatchTestsProps } from "./patch-one";
import { defaultResponse, expectedDataNotFound } from "./common";
import { generateHttpCase } from "./generate-http-case";
import { classifyAuth, generateNotAllowedTest, putUser } from "./auth";

const getOneTestsGlobalConfig = {
  url: "/id",
};

export function getOneTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp, getTestingSetup, buildDynamicConfig } = props;
  const validUrl = props.url ?? getOneTestsGlobalConfig.url;

  describe("get one by id", () => {
    const { allowed, notAllowed } = classifyAuth(props.auth);

    for (const entry of allowed) {
      describe(`allowed auth ${entry.name}`, () => {
        const { user } = entry;
        const ctx: TestGroupConfigCtx = {
          authUser: user,
        };
        const dynamicConfig = buildDynamicConfig(ctx);
        const { expectBody } = defaultResponse(dynamicConfig, props.expectBody);
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
          mockConfigs: [{
            ...props.buildDynamicConfig(ctx).mockConfig,
          }],
          request: {
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: {
            body: expectBody
              ? (body)=>{
                expectBody(body, {
                  ctx,
                  dynamicConfig,
                  beforeExecution: props.beforeExecution,
                } );
              }
              : undefined,
            statusCode: HttpStatus.OK,
          },
        } );

        generateHttpCase( {
          name: "not found case",
          mockConfigs: [{
            ...props.buildDynamicConfig(ctx).mockConfig,
            returned: null,
          }],
          request: {
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: expectedDataNotFound,
        } );
      } );
    }

    for (const entry of notAllowed) {
      generateNotAllowedTest( {
        getExpressApp,
        getTestingSetup,
        request: {
          method: "get",
          url: validUrl,
        },
        entry,
        after: props.afterEach,
        before: props.beforeEach,
      } );
    }
  } );
}
