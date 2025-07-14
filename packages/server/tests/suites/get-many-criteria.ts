import { assertIsDefined } from "$sharedSrc/utils/validation";
import { HttpStatus } from "@nestjs/common";
import { autoProps, PatchTestsProps } from "./patch-one";
import { generateCase } from "./generate-case";
import { defaultResponse } from "./common";

function defaultProps<R>(props: PatchTestsProps<R>) {
  const validUrl = props.url ?? "/search";
  const { getFn,
    repoReturned, validInput } = autoProps(props);
  const { expectedBody } = defaultResponse(props);

  return {
    validInput,
    validUrl,
    expectedBody,
    getFn,
    repoReturned,
  };
}

export function getManyCriteriaTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp } = props;
  const { getFn,
    repoReturned, validUrl, validInput, expectedBody } = defaultProps(props);

  assertIsDefined(validInput, "validInput must be defined in get many criteria tests");

  describe("get many by search", () => {
    generateCase( {
      name: "valid case",
      method: "post",
      body: validInput,
      url: validUrl,
      getExpressApp,
      expected: {
        expectBody: props.expectBody
          ? (body: any) => props.expectBody!(body, repoReturned)
          : undefined,
        body: expectedBody,
        statusCode: HttpStatus.OK,
      },
      mock: {
        fn: [{
          ...props.repo,
          getFn,
        }],
      },
    } );

    generateCase( {
      name: "invalid case",
      method: "post",
      body: {
        cosarara: "porquesi",
      },
      url: validUrl,
      getExpressApp,
      expected: {
        body: undefined,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      },
    } );

    for (const customCase of props.customCases ?? [])
      generateCase(customCase(props));
  } );
}
