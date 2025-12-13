import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud } from "#modules/utils/resources/useCrud";
import { classes } from "#modules/utils/styles";
import { OutputText } from "#modules/ui-kit/output/Text";
import { EpisodeFileInfosApi } from "#modules/series/episodes/file-info/requests";
import { secsToMmss } from "#modules/utils/dates";
import { ResourceInputTime } from "#modules/ui-kit/input/ResourceInputTime";
import { useUpdateCrud } from "#modules/utils/resources/UseCrudComps/update";
import commonStyle from "../../../history/entry/body-common.module.css";
import { EPISODE_FILE_INFO_PROPS } from "./utils";
import styles from "./style.module.css";
import { UseCrudWithElementsProps } from "./useEpisodeCrudWithElements";

export type Data = EpisodeFileInfoEntity;

function getAndUpdateFileInfoByProp<V>(
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

export type UseEpisodeFileInfoCrudWithElementsProps<T> = UseCrudWithElementsProps<T>;

export function useEpisodeFileInfoCrudWithElements<T extends Data =
  Data>( { data,
  setData,
  onPressEnter }: UseEpisodeFileInfoCrudWithElementsProps<T>) {
  const fileInfosApi = FetchApi.get(EpisodeFileInfosApi);
  const { currentData, setCurrentData, isModified,
    reset,
    initialState, addOnReset } = useCrud<T>( {
      data,
      isModifiedFn: calcIsModified,
    } );
  const update = useUpdateCrud( {
    isModified,
    reset,
    setData,
    config: {
      action: async () => {
        const fileInfoBody: EpisodeFileInfosApi.Patch.Body = generatePatchBody(
          data,
          currentData,
          ["end", "start"],
        );
        let fileInfoPromise: Promise<T> = Promise.resolve() as Promise<any>;

        if (shouldSendPatchWithBody(fileInfoBody)) {
          fileInfoPromise = fileInfosApi.fetch(currentData.id, fileInfoBody)
            .then(res=>{
              return res.data as T;
            } );
        }

        return await fileInfoPromise;
      },
    },
  } );
  const state = [currentData, setCurrentData] as const;

  assertIsDefined(update);
  const commonEpisodeInputProps = {
    onPressEnter,
    resourceState: state,
    originalResource: initialState,
    addOnReset,
  };
  const { duration } = currentData.mediaInfo;
  const durationElement = <span className={styles.duration}>{
    OutputText( {
      caption: EPISODE_FILE_INFO_PROPS["mediaInfo.duration"].caption,
      value: isDefined(duration) ? `${secsToMmss(duration)}` : "-",
    } )
  }</span>;
  const pathElement = <span className={styles.path}>{
    OutputText( {
      caption: EPISODE_FILE_INFO_PROPS.path.caption,
      className: commonStyle.autoBreakUrl,
      value: currentData.path,
    } )
  }</span>;
  const startElement = <span className={classes(styles.start)}>
    {ResourceInputTime( {
      caption: EPISODE_FILE_INFO_PROPS.start.caption,
      ...getAndUpdateFileInfoByProp<number>("start"),
      ...commonEpisodeInputProps,
      isOptional: true,
    } )}
  </span>;
  const endElement = <span className={classes(styles.end)}>
    {ResourceInputTime( {
      caption: EPISODE_FILE_INFO_PROPS.end.caption,
      ...getAndUpdateFileInfoByProp<number>("end"),
      ...commonEpisodeInputProps,
      isOptional: true,
    } )}
  </span>;

  return {
    elements: {
      startElement,
      endElement,
      pathElement,
      durationElement,
    },
    actions: {
      update,
      reset,
    },
    state,
    isModified,
  };
}

function calcIsModified(r1: EpisodeFileInfoEntity, r2: EpisodeFileInfoEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      start: true,
      end: true,
    },
  } );
}
