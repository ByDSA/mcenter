import { HttpStatus } from "@nestjs/common";
import { autoProps, PatchTestsProps } from "./patch-one";
import { generateCase } from "./generate-case";
import { defaultResponse } from "./common";

export function getOneTests<R>(props: PatchTestsProps<R>) {
  const { getExpressApp } = props;
  const { getFn,
    repoReturned } = autoProps(props);
  const { expectedBody } = defaultResponse(props);
  const validUrl = props.url ?? "/id";

  describe("get one by id", () => {
    generateCase( {
      name: "valid case",
      mock: {
        fn: [{
          ...props.repo,
          getFn,
        }],
      },
      url: validUrl,
      getExpressApp,
      expected: {
        expectBody: props.expectBody
          ? (body: any) => props.expectBody!(body, repoReturned)
          : undefined,
        body: expectedBody,
        statusCode: HttpStatus.OK,
      },
    } );

    generateCase( {
      name: "not found case",
      mock: {
        fn: [{
          ...props.repo,
          getFn,
          returned: null,
        }],
      },
      url: validUrl,
      getExpressApp,
      expected: {
        body: undefined,
        statusCode: HttpStatus.NOT_FOUND,
      },
    } );
  } );
}
