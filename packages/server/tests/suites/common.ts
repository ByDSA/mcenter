import type { PatchTestsProps, TestDynamicConfig } from "./patch-one";
import assert from "node:assert";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";
import { expectBodyEquals } from "./generate-http-case";

export function defaultResponse<R>(
  config: TestDynamicConfig,
  expectBody: PatchTestsProps<R>["expectBody"],
) {
  const repoReturned = config.mockConfig.returned;

  if (!expectBody && repoReturned) {
    expectBody = expectBodyEquals(
      createSuccessResultResponse(JSON.parse(JSON.stringify(repoReturned))),
    );
  }

  const shouldReturn = !!expectBody;

  return {
    shouldReturn,
    expectBody,
  };
}

export const expectBodyNotFound = (body: unknown) => {
  assert(
    typeof body === "object" && body !== null,
  );
  assert("data" in body && body.data === null);
  assert("errors" in body && Array.isArray(body.errors));
  assert(body.errors[0]?.message);
  assert(typeof body.errors[0].message === "string");
  assert(body.errors[0].message.includes("Data not found"));
};

export const expectUnprocessableEntity = (body: unknown) => {
  assert(
    typeof body === "object" && body !== null,
  );
  assert("errors" in body);
  assert(Array.isArray(body.errors));
  assert(body.errors[0].type === "CustomValidationError");
};

export const expectedUnprocessableEntity = {
  expectBody: expectUnprocessableEntity,
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
};

export const expectedDataNotFound = {
  expectBody: expectBodyNotFound,
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
};
