import type { PatchTestsProps } from "./patch-one";
import { createSuccessDataResponse } from "$shared/utils/http/responses";

export function defaultResponse<R>(props: PatchTestsProps<R>) {
  let { expectedBody, repo } = props;
  const repoReturned = repo.returned;

  if (expectedBody === undefined && repoReturned && !props.expectBody)
    expectedBody = createSuccessDataResponse(JSON.parse(JSON.stringify(repoReturned)));

  const shouldReturn = !!props.expectBody || !!expectedBody;

  return {
    shouldReturn,
    expectedBody,
  };
}
