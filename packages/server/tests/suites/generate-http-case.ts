/* eslint-disable jest/no-export */
import request, { Request, Response } from "supertest";
import { HttpStatus, Logger } from "@nestjs/common";
import { Application } from "express";
import { createManualLogger } from "#core/logging/tests/create-manual-logger";
export type MockConfig<F extends (...args: unknown[])=> unknown> = {
  // Es una función para que se pueda usar el repo que se inyecta en ejecución:
  getFn: ()=> jest.MockedFunction<F>;
  returned?: ReturnType<F>; // Si implementation se usa, returned se ignora
  implementation?: F;
  expected?: {
    params?: Parameters<F>;
    callCount?: number;
  };
};

export let logger: Logger;

export type BeforeProps = {
  request: Request;
};

export type AfterProps = BeforeProps & {
  response: Response;
};

export type GenerateHttpCaseProps = {
  name: string;
  request: {
    method?: "delete" | "get" | "patch" | "post" | "put";
    url: string;
    body?: object;
  };
  getExpressApp: ()=> Application;
  response: {
    body?: (obj: object)=> void;
    statusCode?: HttpStatus;
  };
  beforeAll?: ()=> Promise<void>;
  before?: (props: BeforeProps)=> Promise<void>;
  after?: (props: AfterProps)=> Promise<void>;
  customTests?: ()=> void;
  mockConfigs?: MockConfig<(...args: any[])=> any>[];
};

export function generateHttpCase(props: GenerateHttpCaseProps) {
  // Previene el efecto del uso externo en beforeEach de jest.clearAllMocks():
  let mockFnCalls: unknown[][];
  // eslint-disable-next-line require-await
  const innerBeforeAll = async () => {
    if (props.mockConfigs) {
      for (const mockConfig of props.mockConfigs) {
        const mockFn = mockConfig.getFn();

        if (mockConfig.implementation)
          mockFn.mockImplementation(mockConfig.implementation);
        else
          mockFn.mockReturnValue(mockConfig.returned);
      }
    }
  };
  const httpMethod: Required<typeof props.request.method> = props.request.method ?? "get";
  let response: request.Response;

  describe(`${httpMethod.toUpperCase()} ${props.request.url}: ${props.name}`, () => {
    beforeAll(async () => {
      await innerBeforeAll();
      await props.beforeAll?.();

      logger = createManualLogger(`case ${httpMethod} ${props.name}`);

      logger.debug("Executing case");

      const req = request(props.getExpressApp())[httpMethod](props.request.url);

      await props.before?.( {
        request: req,
      } );

      logger.debug("Executing request" + props.request.body
        ? "with body: " + JSON.stringify(props.request.body, null, 2)
        : "");
      response = await req.send(props.request.body);

      await props.after?.( {
        request: req,
        response,
      } );

      mockFnCalls = (props.mockConfigs ?? []).map((m) => m.getFn().mock.calls);
    } );

    if (props.response.statusCode !== undefined) {
      it("should return status code " + props.response.statusCode, () => {
        expect(response.statusCode).toBe(props.response.statusCode);
      } );
    }

    if (props.response.body) {
      // eslint-disable-next-line jest/expect-expect
      it("should return expected body", () => {
        props.response.body?.(response.body);
      } );
    }

    for (let i = 0; i < (props.mockConfigs?.length ?? 0); i++) {
      const mockConfig = props.mockConfigs?.[i]!;
      const { expected } = mockConfig;
      const expectedTimes = expected?.callCount ?? 1;

      it("should call mock function " + expectedTimes + " times", () => {
        const calls = mockFnCalls[i];

        expect(calls).toHaveLength(expectedTimes);
      } );

      if (expected?.params) {
        it("should call mock function with params: " + JSON.stringify(expected.params), () => {
          const callParams = mockFnCalls[i][0];

          expect(callParams).toEqual(expected.params);
        } );
      }
    }

    props.customTests?.();
  } );
}

export function expectBodyEquals(
  expectedBody: object,
): NonNullable<GenerateHttpCaseProps["response"]["body"]> {
  return (actualBody: object) => {
    expect(actualBody).toEqual(expectedBody);
  };
}
