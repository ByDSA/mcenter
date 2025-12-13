/* eslint-disable require-await */
import { EpisodeEntity } from "$shared/models/episodes";
import { ResourceInputArrayString, ResourceInputText } from "#uikit/input";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { ResourceInputCommonProps, ResourceState } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { AddOnReset, SetState, useCrud, UseCrudProps } from "#modules/utils/resources/useCrud";
import { useUpdateCrud } from "#modules/utils/resources/UseCrudComps/update";
import { EpisodesApi } from "../requests";
import { EPISODE_PROPS } from "./utils";

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

export type UseCrudWithElementsProps<T> = UseEpisodeCrudProps<T> & {
  onPressEnter: ()=> void;
};

export type UseEpisodeCrudWithElementsProps<T> = UseCrudWithElementsProps<T>;

type EpisodeFormElementsProps = {
  addOnReset: AddOnReset<EpisodeEntity>;
  reset: ()=> Promise<void>;
  state: ResourceState<EpisodeEntity>;
  initialState: EpisodeEntity;
  onPressEnter: ()=> void;
};

function genEpisodeFormElements(props: EpisodeFormElementsProps) {
  const { addOnReset, initialState, onPressEnter, state } = props;
  const commonEpisodeInputProps = {
    onPressEnter,
    resourceState: state,
    originalResource: initialState,
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
    titleElement,
    tagsElement,
  };
}

export function useEpisodeCrudWithElements<T extends EpisodeEntity =
  EpisodeEntity>(props: UseEpisodeCrudWithElementsProps<T>) {
  const { state, isModified,
    reset, addOnReset,
    update, initialState } = useEpisodeCrud(props);
  const elements = genEpisodeFormElements( {
    addOnReset,
    initialState,
    onPressEnter: props.onPressEnter,
    reset,
    state,
  } );

  return {
    elements,
    actions: {
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

type UseEpisodeCrudProps<T> = Pick<UseCrudProps<T>, "data"> & {
  setData: SetState<T>;
};
function useEpisodeCrud<T extends EpisodeEntity =
  EpisodeEntity>(props: UseEpisodeCrudProps<T>) {
  const { data, setData } = props;
  const api = FetchApi.get(EpisodesApi);
  const { currentData, setCurrentData, ...other } = useCrud<T>( {
    data,
    isModifiedFn: calcIsModified,
  } );
  const update = useUpdateCrud( {
    isModified: other.isModified,
    reset: other.reset,
    setData,
    config: {
      beforeAction: async () => {
        const episodeBody = generatePatchBody(
          data,
          currentData,
          ["title", "disabled", "tags"],
        );

        return {
          param: episodeBody,
          shouldDo: shouldSendPatchWithBody(episodeBody),
        };
      },
      action: async (episodeBody: any) => {
        const res = await api.patch(data.compKey, episodeBody);

        return res.data as T;
      },
    },
  } );

  return {
    state: [currentData, setCurrentData] as const,
    ...other,
    update,
  };
}
