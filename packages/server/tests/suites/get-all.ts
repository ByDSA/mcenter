import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { TestGroupConfigCtx, PatchTestsProps } from "./patch-one";
import { defaultResponse } from "./common";
import { generateHttpCase } from "./generate-http-case";
import { expectBodyEquals } from "./generate-http-case";
import { classifyAuth, generateNotAllowedTest, putUser } from "./auth";

export function getAllTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp, getTestingSetup, buildDynamicConfig } = props;
  const validUrl = props.url ?? "/";

  describe("get all", () => {
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
          request: {
            method: "get",
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
          mockConfigs: [{
            ...props.buildDynamicConfig(ctx).mockConfig,
          }],
        } );

        generateHttpCase( {
          name: "not found case",
          request: {
            method: "get",
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: {
            body: expectBodyEquals(
              createSuccessResultResponse([]),
            ),
            statusCode: HttpStatus.OK,
          },
          mockConfigs: [{
            ...props.buildDynamicConfig(ctx).mockConfig,
            returned: [],
          }],
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
