import { isModified as isModifiedd } from "#modules/utils/objects";
import { HistoryMusicEntry, MusicVO, assertIsMusicVO } from "#shared/models/musics";
import { assertIsDefined } from "#shared/utils/validation";
import React, { useEffect, useMemo } from "react";
import Body from "./Body";
import Header from "./Header";
import style from "./style.module.css";

function calcIsModified(r1: MusicVO, r2: MusicVO) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export default function HistoryEntryElement( {value: entry, showDate = true}: Props<HistoryMusicEntry>) {
  const [isBodyVisible, setBodyVisible] = React.useState(false);
  const resourceBase = useResourceBase(entry, calcIsModified);
  const resourceState = React.useState(resourceBase);
  const [resource] = resourceState;
  const isModified = useIsModified(resourceBase, resource, calcIsModified);

  // Para mostrar/ocultar 'update' en tiempo real en el body
  // eslint-disable-next-line no-empty-function
  useEffect(() => {
  }, [isModified]);

  const toggleShowBody = () => {
    setBodyVisible(!isBodyVisible);
  };
  const {errors} = useValidation(resource);
  const initialResource = useMemo(()=> entry.resource, []);

  return (
    <div className={`music ${style.container}`}>
      {Header( {
        entry,
        showDate,
        toggleShowBody,
      } )}
      {
        Body( {
          isBodyVisible,
          entry,
          resourceState,
          initialResource,
          isModified,
          errors,
        } )
      }
    </div>
  );
}

function useValidation<T>(resource: T): {isValid: boolean; errors: Record<keyof T, string>} {
  const [errors, setErrors] = React.useState( {
  } as Record<keyof T, string>);

  useEffect(() => {
    try {
      assertIsMusicVO(resource, {
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
  const errors: {} = {
  };
  const {issues} = e;

  for (const issue of issues) {
    const path = issue.path[0];
    const {message} = issue;

    errors[path] = message;
  }

  return errors;
}

type CompareFn<T> = (r1: T, r2: T)=> boolean;
function useResourceBase(entry: HistoryMusicEntry, compare: CompareFn<MusicVO>) {
  const entryResource = entry.resource;

  assertIsDefined(entryResource);
  const [resourceBase, setResourceBase] = React.useState(entryResource);

  useEffect(() => {
    if (compare(entryResource, resourceBase))
      setResourceBase(entryResource);
  }, [entry, entryResource]);

  return resourceBase;
}

function useIsModified<T>(base: T, current: T, compare: CompareFn<T>) {
  const [isModified, setIsModified] = React.useState(false);

  useEffect(() => {
    const v = compare(base, current);

    setIsModified(v);
  }, [base, current]);

  return isModified;
}