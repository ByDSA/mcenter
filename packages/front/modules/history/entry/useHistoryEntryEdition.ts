import { assertIsDefined } from "$shared/utils/validation";
import { useAsyncAction } from "#modules/ui-kit/input";
import { UseResourceEditionProps, UseResourceEditionRet, useResourceEdition } from "../../utils/resources/useResourceEdition";

type Props<T, ID, FetchPatchReqBody, FetchPatchResBody> = {
  resource: UseResourceEditionProps<T, ID, FetchPatchReqBody, FetchPatchResBody>;
  delete?: {
    fetch: (historyListId: any, historyEntryId: any)=> Promise<any>;
  };
};
type Ret<T> = {
 resource: UseResourceEditionRet<T>;
 delete?: {
    action: ()=> Promise<any>;
    isDoing: boolean;
  };
};
export function useHistoryEntryEdition<T extends object, ID, FetchPatchReqBody, FetchPatchResBody>(
  params: Props<T, ID, FetchPatchReqBody, FetchPatchResBody>,
): Ret<T> {
  const resourceRet = useResourceEdition(params.resource);
  const ret: Ret<T> = {
    resource: resourceRet,
  };

  if (params.delete) {
    const asyncDeleteAction = useAsyncAction();
    const remove = () => {
      const { entry } = params.resource;

      if (!confirm(`Borar esta entrada del historial?\n${ JSON.stringify( {
        entryId: entry.id,
        resourceId: entry.resourceId,
        date: entry.date,
      }, null, 2)}`))
        return Promise.resolve();

      const { done, start } = asyncDeleteAction;

      start();
      const historyEntryId = entry.id;
      const { historyListId } = entry;

      assertIsDefined(historyEntryId);

      // Para músicas es undefined:
      // assertIsDefined(historyListId);
      return params.delete?.fetch(historyListId, historyEntryId)
        .then(() => done());
    };

    ret.delete = {
      action: remove as ()=> Promise<any>,
      isDoing: asyncDeleteAction.isDoing,
    };
  }

  return ret;
}
