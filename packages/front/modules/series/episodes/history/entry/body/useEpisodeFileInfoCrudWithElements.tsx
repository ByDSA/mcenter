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
import { EPISODE_FILE_INFO_PROPS } from "../utils";
import commonStyle from "../../../../../history/entry/body-common.module.css";
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
  const { state, remove, isModified,
    reset,
    update, initialState, addOnReset } = useCrud<T>( {
      data,
      setData,
      isModifiedFn: calcIsModified,
      fetchUpdate: async () => {
        const dataFileInfo = data;
        const stateFileInfo = state[0];
        const fileInfoBody: EpisodeFileInfosApi.Patch.Body = generatePatchBody(
          dataFileInfo,
          stateFileInfo,
          ["end", "start"],
        );
        let fileInfoPromise: Promise<T> = Promise.resolve() as Promise<any>;

        if (shouldSendPatchWithBody(fileInfoBody)) {
          fileInfoPromise = fileInfosApi.fetch(stateFileInfo.id, fileInfoBody)
            .then(res=>{
              return res.data as T;
            } );
        }

        return {
          data: await fileInfoPromise,
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
  const fileInfo = state[0];
  const { duration } = fileInfo.mediaInfo;
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
      value: state[0].path,
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
      remove,
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
