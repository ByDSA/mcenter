import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeUserInfoEntity } from "$shared/models/episodes";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud } from "#modules/utils/resources/useCrud";
import { EpisodeUserInfosApi } from "#modules/series/episodes/user-info/requests";
import { ResourceInputNumber } from "#modules/ui-kit/input";
import { useUpdateCrud } from "#modules/utils/resources/UseCrudComps/update";
import { EPISODE_USER_INFO_PROPS } from "./utils";
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
  const { currentData, setCurrentData, isModified,
    reset,
    initialState, addOnReset } = useCrud( {
    data,
    isModifiedFn: calcIsModified,
  } );
  const update = useUpdateCrud( {
    config: {
      // eslint-disable-next-line require-await
      beforeAction: async () => {
        const userInfoBody: EpisodeUserInfosApi.Patch.Body = generatePatchBody(
          data,
          currentData,
          ["weight"],
        );

        return {
          param: {
            userInfoBody,
            stateUserInfo: currentData,
          },
          shouldDo: shouldSendPatchWithBody(userInfoBody),
        };
      },
      action: async (param: any) => {
        const res = await userInfosApi.fetch(param.stateUserInfo.episodeId, param.userInfoBody);

        return res.data;
      },
    },
    setData,
    reset,
    isModified,
  } );
  const state = [currentData, setCurrentData] as const;

  assertIsDefined(update);
  const commonEpisodeInputProps = {
    onPressEnter,
    resourceState: state,
    originalResource: initialState,
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
