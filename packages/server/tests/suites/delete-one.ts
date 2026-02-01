import { HttpStatus } from "@nestjs/common";
import { assertFoundClient } from "#utils/validation/found";
import { mockMongoId } from "#tests/mongo";
import { TestGroupConfigCtx, PatchTestsProps } from "./patch-one";
import { defaultResponse, expectedDataNotFound } from "./common";
import { classifyAuth, generateNotAllowedTest, putUser } from "./auth";
import { generateHttpCase } from "./generate-http-case";

export function deleteOneTests<R>(props: PatchTestsProps<R>) {
  const { buildDynamicConfig, getExpressApp, getTestingSetup } = props;
  const validUrl = props.url ?? "/" + mockMongoId;

  describe("delete one", () => {
    const { allowed, notAllowed } = classifyAuth(props.auth);

    for (const entry of allowed) {
      describe(`allowed auth ${entry.name}`, () => {
        const { user } = entry;
        const ctx: TestGroupConfigCtx = {
          authUser: user,
        };
        const dynamicConfig = buildDynamicConfig(ctx);
        const { expectBody, shouldReturn } = defaultResponse(dynamicConfig, props.expectBody);
        const beforeEach: typeof props.beforeEach = entry
          ? async (p) => {
            await putUser( {
              getTestingSetup,
              request: p.request,
              user,
            } );

            return props.beforeEach?.(p);
          }
          : props.beforeEach;

        generateHttpCase( {
          name: "valid case",
          request: {
            method: "delete",
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
            statusCode: shouldReturn ? HttpStatus.OK : HttpStatus.NO_CONTENT,
          },
          mockConfigs: [{
            ...dynamicConfig.mockConfig,
            returned: shouldReturn ? dynamicConfig.mockConfig.returned : undefined,
          }],
        } );

        const { returned, ...mockConfig } = dynamicConfig.mockConfig;

        generateHttpCase( {
          name: "not found case",
          request: {
            method: "delete",
            url: validUrl,
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: expectedDataNotFound,
          mockConfigs: [{
            ...mockConfig,
            implementation: ()=> {
              assertFoundClient(null);
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
          method: "delete",
          url: validUrl,
        },
        entry,
        after: props.afterEach,
        before: props.beforeEach,
      } );
    }
  } );
}
