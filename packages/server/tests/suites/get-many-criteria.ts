import { assertIsDefined } from "$shared/utils/validation";
import { HttpStatus } from "@nestjs/common";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { autoProps, TestGroupConfigCtx, PatchTestsProps, TestDynamicConfig } from "./patch-one";
import { defaultResponse, expectUnprocessableEntity } from "./common";
import { generateHttpCase } from "./generate-http-case";
import { classifyAuth, generateNotAllowedTest, putUser } from "./auth";

function defaultProps<R>(
  config: TestDynamicConfig,
  props: PatchTestsProps<R>,
) {
  const { validInput } = autoProps(config, props.data);
  const { expectBody } = defaultResponse(config, props.expectBody);

  return {
    validInput,
    expectBody,
  };
}

export function getManyCriteriaTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp, getTestingSetup, buildDynamicConfig } = props;
  const validUrl = props.url ?? "/" + GET_MANY_CRITERIA_PATH;

  describe("get many by search", () => {
    const { allowed, notAllowed } = classifyAuth(props.auth);

    for (const entry of allowed) {
      describe(`allowed auth ${entry}`, () => {
        const { user } = entry;
        const ctx: TestGroupConfigCtx = {
          authUser: user,
        };
        const dynamicConfig = buildDynamicConfig(ctx);
        const { validInput, expectBody } = defaultProps(dynamicConfig, props);

        assertIsDefined(validInput, "validInput must be defined in get many criteria tests");
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
            method: "post",
            body: validInput,
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
          name: "invalid case",
          request: {
            method: "post",
            url: validUrl,
            body: {
              cosarara: "porquesi",
            },
          },
          before: beforeEach,
          after: props.afterEach,
          getExpressApp,
          response: {
            body: expectUnprocessableEntity,
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          },
        } );
      } );
    }

    for (const entry of notAllowed) {
      generateNotAllowedTest( {
        getExpressApp,
        getTestingSetup,
        request: {
          method: "post",
          url: validUrl,
        },
        entry,
        after: props.afterEach,
        before: props.beforeEach,
      } );
    }

    for (const customCase of props.customCases ?? [])
      generateHttpCase(customCase(props));
  } );
}
