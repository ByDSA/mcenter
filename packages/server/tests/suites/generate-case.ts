/* eslint-disable jest/no-export */
import request, { Request, Response } from "supertest";
import { HttpStatus, Logger } from "@nestjs/common";
import { Application } from "express";

export let logger: Logger;

type BodyType = Array<any> | object;

export type ExpectedBody = BodyType | (()=> BodyType);

type MockFn<F extends (...args: unknown[])=> unknown> = {
  getFn: ()=> jest.MockedFunction<F>;
  params?: Parameters<F>;
  returned?: ReturnType<F>;
  implementation?: F;
};

export type BeforeProps = {
  request: Request;
};

export type AfterProps = BeforeProps & {
  response: Response;
};

export type GenerateCaseProps = {
  name: string;
  method?: "delete" | "get" | "patch" | "post" | "put";
  url: string;
  body?: BodyType;
  mock?: {
    fn: MockFn<(...args: any[])=> any>[];
  };
  getExpressApp: ()=> Application;
  expected: {
    expectBody?: (body: BodyType)=> void;
    body?: ExpectedBody;
    statusCode?: HttpStatus;
  };
  before?: (props: BeforeProps)=> Promise<void>;
  after?: (props: AfterProps)=> Promise<void>;
};

export function generateCase(props: GenerateCaseProps) {
  const httpMethod: Required<typeof props["method"]> = props.method ?? "get";
  let response: request.Response;
  // Previene el efecto del uso externo en beforeEach de jest.clearAllMocks():
  let mockFnCalls: unknown[][];

  describe(`${httpMethod.toUpperCase()} ${props.url}: ${props.name}`, () => {
    beforeAll(async () => {
      if (props.mock?.fn) {
        for (const mock of props.mock.fn) {
          const mockFn = mock.getFn();

          if (mock.implementation)
            mockFn.mockImplementation(mock.implementation);
          else
            mockFn.mockReturnValue(mock.returned);
        }
      }

      logger = new Logger(`case ${httpMethod} ${props.name}`);

      logger.debug("Executing case");

      const req = request(props.getExpressApp())[httpMethod](props.url);

      await props.before?.( {
        request: req,
      } );

      logger.debug("Executing request" + props.body
        ? "with body: " + JSON.stringify(props.body, null, 2)
        : "");
      response = await req.send(props.body);

      await props.after?.( {
        request: req,
        response,
      } );

      mockFnCalls = (props.mock?.fn ?? []).map((m) => m.getFn().mock.calls);
    } );

    if (props.expected.statusCode !== undefined) {
      it("should return status code " + props.expected.statusCode, () => {
        expect(response.statusCode).toBe(props.expected.statusCode);
      } );
    }

    if (props.expected.expectBody) {
      // eslint-disable-next-line jest/expect-expect
      it("should pass custom body assert", () => {
          props.expected.expectBody!(response.body);
      } );
    }

    if (!props.expected.expectBody || props.expected.body !== undefined) {
      let objBody: BodyType = {};

      if (typeof props.expected.body === "function")
        objBody = props.expected.body();
      else if (props.expected.body)
        objBody = props.expected.body;

      it("should return expected obj body", () => {
        expect(response.body).toEqual(objBody);
      } );
    }

    for (let i = 0; i < (props.mock?.fn.length ?? 0); i++) {
      const mock = props.mock?.fn[i]!;
      const { params: expectedParams } = mock;

      it("should call repository once", () => {
        const calls = mockFnCalls[i];

        expect(calls).toHaveLength(1);
      } );

      if (expectedParams) {
        it("should call repository with params: " + JSON.stringify(expectedParams), () => {
          const callParams = mockFnCalls[i][0];

          expect(callParams).toEqual(expectedParams);
        } );
      }
    }
  } );
}
