import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeUserInfoEntity } from "$shared/models/episodes";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud } from "#modules/utils/resources/useCrud";
import { EpisodeUserInfosApi } from "#modules/series/episodes/user-info/requests";
import { ResourceInputNumber } from "#modules/ui-kit/input";
import { EPISODE_USER_INFO_PROPS } from "../utils";
import styles from "./style.module.css";
import { UseCrudWithElementsProps } from "./useEpisodeCrudWithElements";

export type Data = EpisodeUserInfoEntity;

function getAndUpdateUserInfoByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      [prop]: v,
    } ),
    getValue: (r)=>r[prop],
    name: prop,
  };
}

export type EpisodeUserInfoEntityCrudWithElementsProps<T> = UseCrudWithElementsProps<T>;

export function useEpisodeUserInfoCrudWithElements<T extends Data =
  Data>( { data,
  setData,
  onPressEnter }: EpisodeUserInfoEntityCrudWithElementsProps<T>) {
  const userInfosApi = FetchApi.get(EpisodeUserInfosApi);
  const { state, remove, isModified,
    reset,
    update, initialState, addOnReset } = useCrud<T>( {
      data,
      setData,
      isModifiedFn: calcIsModified,
      fetchUpdate: async () => {
        const dataUserInfo = data;
        const stateUserInfo = state[0];
        const userInfoBody: EpisodeUserInfosApi.Patch.Body = generatePatchBody(
          dataUserInfo,
          stateUserInfo,
          ["weight"],
        );
        let userInfoPromise: Promise<T> = Promise.resolve() as Promise<any>;

        if (shouldSendPatchWithBody(userInfoBody)) {
          userInfoPromise = userInfosApi.fetch(stateUserInfo.episodeId, userInfoBody)
            .then(res=>{
              return res.data as T;
            } );
        }

        return {
          data: await userInfoPromise,
          success: true,
        };
      },
    } );

  assertIsDefined(update);
  const commonEpisodeInputProps = {
    onPressEnter: onPressEnter ?? (()=>update.action()),
    resourceState: state,
    originalResource: initialState[0],
    addOnReset,
  };
  const weightElement = <span className={styles.weight}>{ResourceInputNumber( {
    caption: EPISODE_USER_INFO_PROPS.weight.caption,
    ...getAndUpdateUserInfoByProp<number>("weight"),
    ...commonEpisodeInputProps,
  } )}</span>;

  return {
    elements: {
      weightElement,
    },
    actions: {
      remove,
      update,
      reset,
    },
    state,
    isModified,
  };
}

function calcIsModified(r1: EpisodeUserInfoEntity, r2: EpisodeUserInfoEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      weight: true,
    },
  } );
}
