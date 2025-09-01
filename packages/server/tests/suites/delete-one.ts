import { HttpStatus } from "@nestjs/common";
import { assertFound } from "#utils/validation/found";
import { generateCase } from "./generate-case";
import { autoProps, PatchTestsProps } from "./patch-one";
import { defaultResponse, expectedDataNotFound } from "./common";

export function deleteOneTests<R>(props: PatchTestsProps<R>) {
  const { repo,
    getExpressApp } = props;
  const { getFn, repoReturned } = autoProps(props);
  const { expectedBody, shouldReturn } = defaultResponse(props);
  const validUrl = props.url ?? "/id";

  describe("delete one", () => {
    generateCase( {
      name: "valid case",
      method: "delete",
      url: validUrl,
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
      name: "not found case",
      method: "delete",
      url: validUrl,
      getExpressApp,
      expected: expectedDataNotFound,
      mock: {
        fn: [{
          ...repo,
          getFn,
          returned: undefined,
          implementation: ()=> {
            assertFound(null);
          },
        }],
      },
    } );
  } );
}
