import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeEntity } from "$shared/models/episodes";
import { ResourceInputArrayString, ResourceInputText } from "#uikit/input";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud, UseCrudProps } from "#modules/utils/resources/useCrud";
import { EpisodesApi } from "../../../requests";
import { EPISODE_PROPS } from "../utils";

function getAndUpdateEpisodeByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<EpisodeEntity, V>, "getUpdatedResource" | "getValue" |
  "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      [prop]: v,
    } ),
    getValue: (r)=>r[prop],
    name: prop,
  };
}

export type UseCrudWithElementsProps<T> = Pick<UseCrudProps<T>, "data" | "setData"> & {
  onPressEnter?: ()=> void;
};

export type UseEpisodeCrudWithElementsProps<T> = UseCrudWithElementsProps<T>;

export function useEpisodeCrudWithElements<T extends EpisodeEntity = EpisodeEntity>( { data,
  setData,
  onPressEnter }: UseEpisodeCrudWithElementsProps<T>) {
  const api = FetchApi.get(EpisodesApi);
  const { state, remove, isModified,
    reset, addOnReset,
    update, initialState } = useCrud<T>( {
      data,
      setData,
      isModifiedFn: calcIsModified,
      fetchUpdate: async () => {
        const episodeBody = generatePatchBody(
          data,
          state[0],
          ["title", "disabled", "tags"],
        );

        if (shouldSendPatchWithBody(episodeBody)) {
          const gotData = await api.patch(data.compKey, episodeBody)
            .then(res=>res.data);

          return {
            data: gotData,
            success: true,
          };
        }

        return {
          data: undefined,
          success: false,
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
  const titleElement = ResourceInputText( {
    caption: EPISODE_PROPS.title.caption,
    ...getAndUpdateEpisodeByProp<string>("title"),
    ...commonEpisodeInputProps,

  } );
  const tagsElement = ResourceInputArrayString( {
    caption: EPISODE_PROPS.tags.caption,
    ...getAndUpdateEpisodeByProp("tags"),
    resourceState: state,
    addOnReset,
    onEmptyPressEnter: commonEpisodeInputProps.onPressEnter,
  } );

  return {
    elements: {
      titleElement,
      tagsElement,
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

function calcIsModified(r1: EpisodeEntity, r2: EpisodeEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      title: true,
      disabled: true,
      tags: true,
    },
  } );
}
