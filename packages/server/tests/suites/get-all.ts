import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { autoProps, PatchTestsProps } from "./patch-one";
import { generateCase } from "./generate-case";
import { defaultResponse } from "./common";

function defaultProps<R>(props: PatchTestsProps<R>) {
  const validUrl = props.url ?? "/";
  const { getFn,
    repoReturned } = autoProps(props);
  const { expectedBody } = defaultResponse(props);

  return {
    validUrl,
    expectedBody,
    getFn,
    repoReturned,
  };
}

export function getAllTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp } = props;
  const { getFn,
    repoReturned, validUrl, expectedBody } = defaultProps(props);

  describe("get all", () => {
    generateCase( {
      name: "valid case",
      method: "get",
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
      name: "not found case",
      method: "get",
      url: validUrl,
      getExpressApp,
      expected: {
        body: createSuccessResultResponse([]),
        statusCode: HttpStatus.OK,
      },
      mock: {
        fn: [{
          ...props.repo,
          getFn,
          returned: [],
        }],
      },
    } );
  } );
}
