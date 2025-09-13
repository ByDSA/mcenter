import type { Music, MusicEntity } from "#modules/musics/models";
import type { PropInfo } from "$shared/utils/validation/zod";
import type { OnPressEnter } from "#modules/ui-kit/input/UseInputText";
import type { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { JSX, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { MusicsApi } from "#modules/musics/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useCrud, UseCrudProps } from "#modules/utils/resources/useCrud";
import { DeleteResource, ResetResource, UpdateResource } from "#modules/utils/resources/elements/crud-buttons";
import { MUSIC_PROPS } from "../utils";
import { genTitleElement, genArtistElement, genWeightElement, genAlbumElement, genSlugElement, genTagsElement, genUnknownElement } from "./elements";
import styles from "./styles.module.css";

export type UseMusicCrudWithElementsProps<T> = Pick<UseCrudProps<T>, "data" | "setData"> & {
  shouldFetchFileInfo?: boolean;
};

export function useMusicCrudWithElements<T extends MusicEntity = MusicEntity>( { data,
  setData,
  shouldFetchFileInfo }: UseMusicCrudWithElementsProps<T>) {
  const api = FetchApi.get(MusicsApi);
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);
  const { isModified, remove, reset, addOnReset, state, update, initialState } = useCrud<T>( {
    data,
    setData,
    fetchRemove: async () => {
      if (
        !confirm(
          `Borar esta entrada?\n${ JSON.stringify(data, null, 2)}`,
        )) {
        return Promise.resolve( {
          data: undefined,
          success: false,
        } );
      }

      const res = await api.deleteOneById(data.id);

      return {
        data: res.data as T,
        success: true,
      };
    },
    fetchUpdate: async () => {
      const body: MusicsApi.Patch.Body = generatePatchBody(
        data,
        state[0],
        [
          "title",
          "weight",
          "disabled",
          "tags",
          "album",
          "artist",
          "country",
          "game",
          "spotifyId",
          "slug",
          "year",
        ],
      );
      let musicPromise: Promise<MusicEntity> = Promise.resolve() as Promise<any>;

      if (shouldSendPatchWithBody(body)) {
        musicPromise = api.patch(data.id, body)
          .then(async res=>{
            const music = {
              ...res.data,
            };

            if (shouldFetchFileInfo) {
              const fileInfos = (await fileInfosApi.getAllByMusicId(music.id)).data;

              music.fileInfos = fileInfos;

              assertIsDefined(music.fileInfos);
            }

            return music;
          } );
      }

      await musicPromise;

      let newData: MusicEntity = {
        ...state[0],
      };

      if (await musicPromise)
        newData = await musicPromise as T;

      return {
        data: newData as T,
        success: true,
      };
    },
    isModifiedFn: calcIsModified,
  } );

  assertIsDefined(update);
  assertIsDefined(remove);
  const commonInputProps = {
    resourceState: state,
    originalResource: initialState[0],
    addOnReset,
  };
  const commonSingleInputProps = {
    onPressEnter: ()=>update.action(),
    ...commonInputProps,
  };
  const commonArrayInputProps: Parameters<typeof genTagsElement>[0] = {
    onEmptyPressEnter: ()=>update.action(),
    ...commonInputProps,
  };
  const titleElement = genTitleElement(commonSingleInputProps);
  const artistElement = genArtistElement(commonSingleInputProps);
  const weightElement = genWeightElement(commonSingleInputProps);
  const albumElement = genAlbumElement(commonSingleInputProps);
  const slugElement = genSlugElement(commonSingleInputProps);
  const tagsElement = genTagsElement(commonArrayInputProps);

  function removeFileInfo(id: string) {
    const newData = {
      ...state[0],
      fileInfos: state[0]?.fileInfos?.filter(file => file.id !== id),
    };
    const lastResetData = initialState[0];
    const newResetData = {
      ...lastResetData,
      fileInfos: lastResetData.fileInfos
        ? lastResetData.fileInfos.filter(file => file.id !== id)
        : undefined,
    };

    initialState[1](newResetData);
    state[1](newData);
  }
  function addFileInfo(fileInfo: MusicFileInfoEntity) {
    const newData = {
      ...state[0],
      fileInfos: state[0]?.fileInfos ? [...state[0].fileInfos, fileInfo] : [fileInfo],
    };
    const lastResetData = initialState[0];
    const newResetData = {
      ...lastResetData,
      fileInfos: lastResetData.fileInfos
        ? [...lastResetData.fileInfos, fileInfo]
        : [fileInfo],
    };

    initialState[1](newResetData);
    state[1](newData);
  }

  const [isVisible, setIsVisible] = useState(false);
  const optionalPropsElements = OptionalProps( {
    ...commonSingleInputProps,
    initialResource: initialState[0],
    addOnReset,
    allOptionalPropsVisible: isVisible,
  } );
  const resetElement = <ResetResource onClick={() => reset()} />;
  const deleteElement = <DeleteResource
    action={remove.action as ()=> Promise<any>}
    isDoing={remove.isDoing}
    disabled={remove.isDoing || update.isDoing}
  />;
  const updateElement = <UpdateResource
    action={update.action as ()=> Promise<any>}
    isDoing={update.isDoing}
    disabled={remove.isDoing || update.isDoing}
  />;
  const actionsBar = <span className={classes("line", styles.actionsBar)}>
    {isModified && updateElement}
    {resetElement}
    {remove && deleteElement}
  </span>;

  return {
    elements: {
      titleElement,
      artistElement,
      albumElement,
      weightElement,
      tagsElement,
      slugElement,
    },
    actionElements: {
      actionsBar,
      deleteElement,
      updateElement,
      resetElement,
    },
    optionalProps: {
      elements: optionalPropsElements,
      allVisible: isVisible,
      setAllVisible: setIsVisible,
    },
    actions: {
      reset,
      update,
      remove,
      addFileInfo,
      removeFileInfo,
    },
    isModified,
    state,
  };
}

const optionalPropsOmitKeys = ["lastTimePlayed", "album", "tags"];
const optionalPropsKeys: Record<keyof Music, PropInfo> = Object.entries(MUSIC_PROPS)
  .reduce((acc, [key, value]) => {
    if (value.required)
      return acc;

    if (optionalPropsOmitKeys.includes(key))
      return acc;

    acc[key as keyof Music] = value;

    return acc;
  }, {} as Record<keyof Music, PropInfo>);

type OptionalPropsProps = Omit<ResourceInputCommonProps<MusicEntity, string>, "getUpdatedResource" |
  "getValue" | "name"> & {
  onPressEnter?: OnPressEnter<unknown>;
  initialResource: MusicEntity;
  allOptionalPropsVisible: boolean;
};
function OptionalProps(
  { resourceState, initialResource,
    addOnReset, onPressEnter, allOptionalPropsVisible }: OptionalPropsProps,
) {
  const ret: Record<typeof optionalPropsOmitKeys[0], JSX.Element> = {} as any;
  const entries = Object.entries(optionalPropsKeys) as [
    typeof optionalPropsOmitKeys[0],
    PropInfo
  ][];
  const commonProps = {
    resourceState,
    originalResource: initialResource,
    addOnReset,
    isOptional: true,
    onPressEnter,
  };

  for (const entry of entries) {
    const [prop, propInfo] = entry;
    const { type, caption = prop } = propInfo;
    const isHidden = !(initialResource[prop] !== undefined
      || resourceState[0][prop] !== undefined || allOptionalPropsVisible);
    const hiddenStyle = isHidden
      ? {
        display: "none",
      }
      : undefined;

    ret[prop] = (<>
      <span className={classes("line", "height2")} style={hiddenStyle}>
        {genUnknownElement(type, prop, {
          ...commonProps,
          caption,
          isHidden,
        } )}
      </span>
    </>);
  }

  return ret;
}

function calcIsModified(r1: MusicEntity, r2: MusicEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      title: true,
      album: true,
      artist: true,
      country: true,
      disabled: true,
      game: true,
      tags: true,
      slug: true,
      weight: true,
      year: true,
      fileInfos: true,
      spotifyId: true,
    },
  } );
}
