import type { Music, MusicEntity, MusicUserInfoEntity } from "#modules/musics/models";
import type { PropInfo } from "$shared/utils/validation/zod";
import type { OnPressEnter } from "#modules/ui-kit/input/UseInputText";
import type { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { JSX, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { MusicsApi } from "#modules/musics/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { createFullOp, useCrud, UseCrudProps } from "#modules/utils/resources/useCrud";
import { DeleteResource, ResetResource, UpdateResource } from "#modules/utils/resources/elements/crud-buttons";
import { MusicUserInfosApi } from "#modules/musics/user-info.requests";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { useUpdateCrud } from "#modules/utils/resources/UseCrudComps/update";
import { useOpCrud } from "#modules/utils/resources/UseCrudComps/op";
import { useMusic } from "#modules/musics/hooks";
import { MUSIC_PROPS } from "../MusicEntry/utils";
import { genTitleElement, genArtistElement, genWeightElement, genAlbumElement, genSlugElement, genTagsElement, genUnknownElement } from "./elements";
import styles from "./styles.module.css";

export type UseMusicCrudWithElementsProps<T> = Pick<UseCrudProps<T>, "data">;

function dataJsx(data: Music) {
  return <div>
    <span>Título: {data.title}</span><br/>
    <span>Artista: {data.artist}</span>
  </div>;
}

export function useMusicCrudWithElements
  <T extends MusicEntity = MusicEntity>( { data }: UseMusicCrudWithElementsProps<T>) {
  const api = FetchApi.get(MusicsApi);
  const userInfoApi = FetchApi.get(MusicUserInfosApi);
  const { openModal } = useConfirmModal();
  const { isModified, reset, addOnReset, currentData, initialState, setCurrentData } = useCrud<T>( {
    data,
    isModifiedFn: calcIsModified,
  } );
  const update = useUpdateCrud( {
    isModified,
    reset,
    setData: (music) => {
      useMusic.updateCache(music.id, music);
    },
    config: {
      action: async () => {
        const musicBody: MusicsApi.Patch.Body = generatePatchBody(
          data,
          currentData,
          [
            "title",
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

        if (shouldSendPatchWithBody(musicBody)) {
          musicPromise = api.patch(data.id, musicBody)
            .then(res=>{
              const music = {
                ...res.data,
              };

              return music;
            } );
        }

        let userInfoPromise: Promise<MusicUserInfoEntity> = Promise.resolve() as Promise<any>;

        if (data.userInfo && currentData.userInfo) {
          const userInfoBody: MusicsApi.Patch.Body = generatePatchBody(
            data.userInfo,
            currentData.userInfo,
            [
              "weight",
              "tags",
            ],
          );

          if (
            (data.userInfo.tags?.length ?? 0) === 0 && userInfoBody.entity.tags
        && userInfoBody.entity.tags.length === 0
          )
            delete userInfoBody.entity.tags;

          if (shouldSendPatchWithBody(userInfoBody)) {
            userInfoPromise = userInfoApi.patch(data.id, userInfoBody)
              .then(res=>{
                return res.data;
              } );
          }
        }

        await Promise.all([musicPromise, userInfoPromise].filter(Boolean));

        let newData: MusicEntity = {
          ...currentData,
        };

        if (await musicPromise)
          newData = await musicPromise as T;

        if (await userInfoPromise)
          newData.userInfo = await userInfoPromise;
        else
          newData.userInfo = currentData.userInfo;

        newData.isFav = currentData.isFav; // Porque isFav no se devuelve en el update

        return newData as T;
      },
    },
  } );

  assertIsDefined(update);

  const remove = useOpCrud( {
    beforeAction: async () => {
      let shouldDo = false;

      await openModal( {
        title: "Confirmar borrado",
        content: (<>
          <p>¿Borrar esta música?</p>
          {dataJsx(currentData)}
        </>),
        action: () => {
          shouldDo = true;

          return true;
        },
      } );

      return {
        shouldDo,
        param: undefined,
      };
    },
    action: async () => {
      const res = await api.deleteOneById(data.id);

      return res.data as T;
    },
  } );

  assertIsDefined(remove);
  const commonInputProps = {
    resourceState: [currentData, setCurrentData] as const,
    originalResource: initialState,
    addOnReset,
  };
  const updateFullOp = createFullOp(update.op);
  const commonSingleInputProps = {
    onPressEnter: ()=>updateFullOp(),
    ...commonInputProps,
  };
  const commonArrayInputProps: Parameters<typeof genTagsElement>[0] = {
    onEmptyPressEnter: ()=>updateFullOp(),
    ...commonInputProps,
  };
  const titleElement = genTitleElement(commonSingleInputProps);
  const artistElement = genArtistElement(commonSingleInputProps);
  const weightElement = genWeightElement(commonSingleInputProps);
  const albumElement = genAlbumElement(commonSingleInputProps);
  const slugElement = genSlugElement(commonSingleInputProps);
  const tagsElement = genTagsElement(commonArrayInputProps);

  async function removeFileInfo(id: string) {
    const newData = {
      ...currentData,
      fileInfos: currentData?.fileInfos?.filter(file => file.id !== id),
    };
    const lastResetData = initialState;
    const newResetData = {
      ...lastResetData,
      fileInfos: lastResetData.fileInfos
        ? lastResetData.fileInfos.filter(file => file.id !== id)
        : undefined,
    };

    await reset(newResetData);
    setCurrentData(newData);
  }
  async function addFileInfo(fileInfo: MusicFileInfoEntity) {
    const newData = {
      ...currentData,
      fileInfos: currentData?.fileInfos ? [...currentData.fileInfos, fileInfo] : [fileInfo],
    };
    const lastResetData = initialState;
    const newResetData = {
      ...lastResetData,
      fileInfos: lastResetData.fileInfos
        ? [...lastResetData.fileInfos, fileInfo]
        : [fileInfo],
    };

    await reset(newResetData);
    setCurrentData(newData);
  }

  const [isVisible, setIsVisible] = useState(false);
  const optionalPropsElements = OptionalProps( {
    ...commonSingleInputProps,
    initialResource: initialState,
    addOnReset,
    allOptionalPropsVisible: isVisible,
  } );
  const resetElement = <ResetResource onClick={() => reset()} />;
  const removeFullOp = createFullOp(remove.op);
  const deleteElement = <DeleteResource
    action={async ()=> { await removeFullOp(); }}
    isDoing={remove.isDoing}
    disabled={remove.isDoing || update.isDoing}
  />;
  const updateElement = <UpdateResource
    action={async ()=>{ await updateFullOp(); }}
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
    currentData,
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

function calcMusicIsModified(r1: MusicEntity, r2: MusicEntity) {
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
      year: true,
      fileInfos: true,
      spotifyId: true,
    },
  } );
}

function calcIsModified(r1: MusicEntity, r2: MusicEntity) {
  if (calcMusicIsModified(r1, r2))
    return true;

  if (r1.userInfo && r2.userInfo) {
    return isModifiedd(r1.userInfo, r2.userInfo, {
      ignoreNewUndefined: true,
      shouldMatch: {
        weight: true,
        tags: true,
      },
    } );
  }

  return false;
}
