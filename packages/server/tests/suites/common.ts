import type { PatchTestsProps } from "./patch-one";
import assert from "node:assert";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";

export function defaultResponse<R>(props: PatchTestsProps<R>) {
  let { expectedBody, repo } = props;
  const repoReturned = repo.returned;

  if (expectedBody === undefined && repoReturned && !props.expectBody)
    expectedBody = createSuccessResultResponse(JSON.parse(JSON.stringify(repoReturned)));

  const shouldReturn = !!props.expectBody || !!expectedBody;

  return {
    shouldReturn,
    expectedBody,
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
