import { HttpStatus } from "@nestjs/common";
import { UserRoleName } from "$shared/models/auth";
import { assertFoundClient } from "#utils/validation/found";
import { generateCase } from "./generate-case";
import { autoProps, PatchTestsProps } from "./patch-one";
import { defaultResponse, expectedDataNotFound } from "./common";
import { setAuthRole } from "./auth";

export function deleteOneTests<R>(props: PatchTestsProps<R>) {
  const { repo,
    getExpressApp } = props;
  const { getFn, repoReturned } = autoProps(props);
  const { expectedBody, shouldReturn } = defaultResponse(props);
  const validUrl = props.url ?? "/id";

  describe("delete one", () => {
    const { auth } = props;
    const positiveAuth = auth
      ? Object.entries(auth).filter(([, v])=> v)
        .map(([k])=> k as UserRoleName)
      : undefined;
    const negativeAuth = auth
      ? Object.entries(auth).filter(([, v])=> !v)
        .map(([k])=> k as UserRoleName)
      : undefined;

    for (const role of positiveAuth ?? [null]) {
      const rolePrefix = `${role ? `role=${role} ` : ""}`;
      const beforeEach: typeof props.beforeEach = role
        ? async (p) => {
          await setAuthRole( {
            role,
            req: p.request,
          } );

          return props.beforeEach?.(p);
        }
        : props.beforeEach;

      generateCase( {
        name: `${rolePrefix}valid case`,
        method: "delete",
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
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
        name: `${rolePrefix}not found case`,
        method: "delete",
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: expectedDataNotFound,
        mock: {
          fn: [{
            ...repo,
            getFn,
            returned: undefined,
            implementation: ()=> {
              assertFoundClient(null);
            },
          }],
        },
      } );
    }

    for (const role of negativeAuth ?? []) {
      const rolePrefix = `${role ? `role=${role} ` : ""}`;
      const beforeEach: typeof props.beforeEach = async (p) => {
        await setAuthRole( {
          role,
          req: p.request,
        } );

        return props.beforeEach?.(p);
      };

      generateCase( {
        name: `${rolePrefix}invalid auth`,
        method: "delete",
        url: validUrl,
        before: beforeEach,
        after: props.afterEach,
        getExpressApp,
        expected: {
          expectBody: ()=>undefined, // any body
          statusCode: HttpStatus.FORBIDDEN,
        },
      } );
    }
  } );
}
