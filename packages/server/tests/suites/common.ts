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
  assert("message" in body && typeof body.message === "string");
  assert(body.message.includes("Unprocessable Entity: Data not found"));
};

export const expectedDataNotFound = {
  expectBody: expectBodyNotFound,
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
};
