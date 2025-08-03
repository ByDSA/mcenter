/* eslint-disable require-await */
import clone from "just-clone";
import React, { useEffect, useState } from "react";
import { AssertZodSettings } from "$shared/utils/validation/zod";
import { assertIsDefined } from "$shared/utils/validation";
import { useAsyncAction } from "#modules/ui-kit/input";

type AssertionFn = (model: unknown, settings?: AssertZodSettings)=> void;

type FetchPatch<ID, ReqBody, ResBody> = (id: ID, body: ReqBody)=> Promise<ResBody>;

export type Entry<T, ID> = {
  id?: any;
  date: {
    timestamp: number;
  };
  resource?: T;
  resourceId: ID;
};

export type UseResourceEditionProps<
T, ID, E extends Entry<T, ID>, FetchPatchReqBody, FetchPatchResBody
> = {
  entry: E;
  calcIsModified: (base: T, current: T)=> boolean;
  assertionFn: AssertionFn;
  fetching: {
    patch: {
      fetch: FetchPatch<ID, FetchPatchReqBody, FetchPatchResBody>;
      generateBody: (base: T, current: T)=> FetchPatchReqBody;
    };
    delete?: {
      fetch: (id: ID)=> Promise<void>;
    };
  };
};

export type UseResourceEditionRet<T> = {
  isModified: boolean;
  update: {
    action: ()=> Promise<any>;
    isDoing: boolean;
  };
  delete?: {
    action: ()=> Promise<void>;
    isDoing: boolean;
  };
  reset: ()=> Promise<void>;
  errors?: Record<string, string>;
  resourceState: [T, React.Dispatch<React.SetStateAction<T>>];
};

export function useResourceEdition<
T extends object, ID, E extends Entry<T, ID>, FetchPatchReqBody, FetchPatchResBody
>(
  { entry,
    calcIsModified,
    assertionFn,
    fetching }: UseResourceEditionProps<T, ID, E, FetchPatchReqBody, FetchPatchResBody>,
): UseResourceEditionRet<T> {
  const resourceBase = useResourceBase(entry, calcIsModified);
  const resourceState = useState(clone(resourceBase));
  const [resource, setResource] = resourceState;
  const isModified = useIsModified(resourceBase, resource, calcIsModified);
  const asyncUpdateAction = useAsyncAction();
  const reset = async () => {
    const entryResource = entry.resource;

    assertIsDefined(entryResource);
    setResource(entryResource);
  };
  const { errors } = useValidation(resource, assertionFn);
  const update = async () => {
    if (!isModified)
      return;

    const { done, start } = asyncUpdateAction;

    start();
    const id = entry.resourceId;
    const { patch: { fetch: fetchPatch,
      generateBody: generatePatchBody } } = fetching;

    assertIsDefined(entry.resource);
    const patchBodyParams = generatePatchBody(entry.resource, resource);

    return fetchPatch(id, patchBodyParams)
      .then(() => {
        entry.resource = resource;
      } )
      .then(()=>done());
  };
  const ret: UseResourceEditionRet<T> = {
    isModified,
    update: {
      action: update,
      isDoing: asyncUpdateAction.isDoing,
    },
    reset,
    errors,
    resourceState,
  };

  return ret;
}

type CompareFn<T> = (r1: T, r2: T)=> boolean;
function useResourceBase<T, ID, E extends Entry<T, ID>>(entry: E, compare: CompareFn<T>) {
  const entryResource = entry.resource;

  assertIsDefined(entryResource);
  const [resourceBase, setResourceBase] = React.useState(entryResource as T);

  useEffect(() => {
    if (compare(entryResource, resourceBase))
      setResourceBase(entryResource);
  }, [entry, entryResource]);

  return resourceBase;
}

function useIsModified<T>(base: T, current: T, compare: CompareFn<T>) {
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const v = compare(base, current);

    setIsModified(v);
  }, [base, current]);

  return isModified;
}

function useValidation<T>(resource: T, assertionFn: AssertionFn): {isValid: boolean;
errors: Record<keyof T, string>;} {
  const [errors, setErrors] = React.useState( {} as Record<keyof T, string>);

  useEffect(() => {
    try {
      assertionFn(resource, {
        useZodError: true,
      } );
    } catch (e) {
      if (e.name !== "ZodError")
        throw e;

      setErrors(parseErrors(e) as Record<keyof T, string>);
    }
  }, [resource]);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

type ZodIssue = {
  "code": string;
  "expected": string;
  "received": string;
  "path": string[];
  "message": string;
};

type ZodError = {
  issues: ZodIssue[];
};
function parseErrors(e: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  const { issues } = e;

  for (const issue of issues) {
    const [path] = issue.path;
    const { message } = issue;

    errors[path] = message;
  }

  return errors;
}
