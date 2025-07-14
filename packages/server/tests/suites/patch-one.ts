import { HttpStatus } from "@nestjs/common";
import { Application } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { assertFound } from "#utils/validation/found";
import { ExpectedBody, generateCase, GenerateCaseProps } from "./generate-case";
import { defaultResponse } from "./common";

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
    generateCase( {
      name: "valid case",
      method: "patch",
      body: validInput,
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
      name: "invalid input case",
      method: "patch",
      body: invalidInput,
      url: validUrl,
      getExpressApp,
      expected: {
        body: undefined,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      },
    } );

    generateCase( {
      name: "not found case",
      method: "patch",
      body: validInput,
      url: validUrl,
      getExpressApp,
      expected: {
        body: undefined,
        statusCode: HttpStatus.NOT_FOUND,
      },
      mock: {
        fn: [{
          ...repo,
          getFn,
          returned: undefined,
          implementation: ()=> {
            assertFound(undefined);
          },
        }],
      },
    } );
  } );
}
