import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { backendUrl } from "#modules/requests";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud, UseCrudProps } from "#modules/utils/resources/useCrud";
import { classes } from "#modules/utils/styles";
import { OutputText } from "#modules/ui-kit/output/Text";
import { EpisodesApi } from "../../../requests";
import { EPISODE_PROPS } from "../utils";
import commonStyle from "../../../../../history/entry/body-common.module.css";
import styles from "./style.module.css";

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
          ["title", "weight", "disabled", "tags"],
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
  const resource = state[0];
  const slug = fullUrlOf(resource);
  const urlElement = <span className={classes(styles.url, commonStyle.autoBreakUrl)}>
    {OutputText( {
      caption: <><a href={slug}>Url</a>:</>,
      value: slug,
    } )}
  </span>;
  const weightElement = <span className={styles.weight}>{ResourceInputNumber( {
    caption: EPISODE_PROPS.weight.caption,
    ...getAndUpdateEpisodeByProp<number>("weight"),
    ...commonEpisodeInputProps,
  } )}</span>;

  return {
    elements: {
      titleElement,
      urlElement,
      tagsElement,
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

function fullUrlOf(resource: EpisodeEntity) {
  return backendUrl(
    PATH_ROUTES.episodes.slug.withParams(resource.compKey.seriesKey, resource.compKey.episodeKey),
  );
}

function calcIsModified(r1: EpisodeEntity, r2: EpisodeEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      title: true,
      weight: true,
      disabled: true,
      tags: true,
    },
  } );
}
