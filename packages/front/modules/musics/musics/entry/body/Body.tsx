import type { Music, MusicEntity } from "#modules/musics/models";
import type { PropInfo } from "$shared/utils/validation/zod";
import type { OnPressEnter } from "#modules/ui-kit/input/UseInputText";
import type { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { Fragment, JSX, useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { LinkAsyncAction, ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { useHistoryEntryEdition } from "#modules/history/entry/useHistoryEntryEdition";
import { backendUrl } from "#modules/requests";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { MusicsApi } from "#modules/musics/requests";
import { ResourceInputBoolean } from "#modules/ui-kit/input/ResourceInputBoolean";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { Data } from "../../types";
import commonStyle from "../../../../history/entry/body-common.module.css";
import { MUSIC_FILE_INFO_PROPS, MUSIC_PROPS } from "../utils";
import style from "./style.module.css";

function getAndUpdateMusicByProp<V>(
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

export type BodyProps = {
  data: MusicEntity;
  setData: (newData: MusicEntity)=> void;
  shouldFetchFileInfo?: boolean;
};

export function Body( { data, setData, shouldFetchFileInfo }: BodyProps) {
  const api = FetchApi.get(MusicsApi);
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);
  const { state, remove, isModified,
    reset, addOnReset,
    update, initialState } = useHistoryEntryEdition<MusicEntity>( {
      data,
      setData,
      isModifiedFn: calcIsModified,
      fetchRemove: async ()=> {
        const res = await api.deleteOneById(data.id);

        return {
          data: res.data as Data,
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

        let fileInfoPromise: ReturnType<
          typeof fileInfosApi.patch
        > = Promise.resolve() as Promise<any>;

        if (data.fileInfos && data.fileInfos.length > 0
          && state[0].fileInfos && state[0].fileInfos.length > 0) {
          const dataFileInfo = data.fileInfos[0];
          const stateFileInfo = state[0].fileInfos[0];
          const fileInfoBody = generatePatchBody(
            dataFileInfo,
            stateFileInfo,
            ["path"],
          );

          if (Object.entries(fileInfoBody.entity).length > 0)
            fileInfoPromise = fileInfosApi.patch(stateFileInfo.id, fileInfoBody);
        }

        await Promise.all([musicPromise, fileInfoPromise]);

        let newData: MusicEntity = {
          ...state[0],
        };

        if (await musicPromise)
          newData = await musicPromise as Data;

        if (newData && await fileInfoPromise)
          newData.fileInfos = [(await fileInfoPromise).data];

        return {
          data: newData as Data,
          success: true,
        };
      },
    } );
  const optionalProps: Record<keyof Music, PropInfo> = Object.entries(MUSIC_PROPS)
    .reduce((acc, [key, value]) => {
      if (value.required)
        return acc;

      if (["lastTimePlayed", "album", "tags"].includes(key))
        return acc;

      acc[key as keyof Music] = value;

      return acc;
    }, {} as Record<keyof Music, PropInfo>);
  const commonInputProps = {
    onPressEnter: ()=>update.action(),
    resourceState: state,
    originalResource: initialState[0],
    addOnReset,
  };
  const titleElement = ResourceInputText( {
    caption: MUSIC_PROPS.title.caption,
    ...getAndUpdateMusicByProp<string>("title"),
    ...commonInputProps,
  } );
  const artistElement = ResourceInputText( {
    caption: MUSIC_PROPS.artist.caption,
    ...getAndUpdateMusicByProp<string>("artist"),
    ...commonInputProps,
  } );
  const titleArtist = <span className={classes("line", style.titleArtist)}>
    <span className={`${"height2"} ${style.title}`}>
      {titleElement}
    </span>
    <span className={`${"height2"} ${style.artist}`}>
      {artistElement}
    </span>
  </span>;
  const resource = state[0];
  const { fileInfos } = resource;

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

  return <div className={classes(style.container, commonStyle.container)}>
    {titleArtist}

    <span className={classes("line", style.weightAlbum)}>
      <span className={classes("height2", style.weight)}>
        {ResourceInputNumber( {
          caption: MUSIC_PROPS.weight.caption,
          ...getAndUpdateMusicByProp<number>("weight"),
          ...commonInputProps,
        } )}
      </span>
      <span className={classes("height2", style.album)}>
        {ResourceInputText( {
          caption: MUSIC_PROPS.album.caption,
          ...getAndUpdateMusicByProp<string>("album"),
          ...commonInputProps,
          isOptional: true,
        } )}
      </span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{MUSIC_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        ...getAndUpdateMusicByProp<string[]>("tags"),
        resourceState: state,
        addOnReset,
        onEmptyPressEnter: commonInputProps.onPressEnter,
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInputText( {
        caption: <><a href={fullUrlOf(resource.slug)}>Url</a>:</>,
        ...getAndUpdateMusicByProp<string>("slug"),
        ...commonInputProps,
      } )}
    </span>
    {OptionalProps( {
      optionalProps,
      ...commonInputProps,
      ...commonInputProps,
      initialResource: initialState[0],
      addOnReset,
    } )}

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span className={commonStyle.update}>{
        <LinkAsyncAction
          action={update.action as ()=> Promise<any>}
          isDoing={update.isDoing}
        >Update</LinkAsyncAction>
      }</span>}</span>
    <span className={"break"} />
    {
      remove
    && <>
      <span className={"line"}>
        <LinkAsyncAction
          action={remove.action as ()=> Promise<any>}
          isDoing={remove.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    {
      fileInfos
    && <details>
      <summary>Files ({fileInfos.length})</summary>
      {
        fileInfos.map((f)=>{
          const { duration } = f.mediaInfo;

          return (
            <Fragment key={f.hash}>
              <hr/>
              <span className={classes("line", "height2", commonStyle.url)}>
                <span>{MUSIC_FILE_INFO_PROPS.path.caption}</span>
                <span className={commonStyle.content}>{f.path}</span>
              </span>
              <span className={classes("line", "height2", style.duration)}>
                <span>{MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption}</span>
                <span>{(isDefined(duration) && <>{secsToMmss(duration)} ({duration} s)</>) || "-"}</span>
              </span>
              <span className={classes("line", "height2", commonStyle.url)}>
                <span>{MUSIC_FILE_INFO_PROPS.hash.caption}</span>
                <span className={commonStyle.content}>{f.hash}</span>
              </span>
              <span className={classes("line", "height2", commonStyle.url)}>
                <span>{MUSIC_FILE_INFO_PROPS.size.caption}</span>
                <span className={commonStyle.content}>{f.size}</span>
              </span>
              <span className={classes("line", "height2", commonStyle.url)}>
                <span>{MUSIC_FILE_INFO_PROPS["timestamps.createdAt"].caption}</span>
                <span className={commonStyle.content}>{f.timestamps.createdAt.toISOString()}</span>
              </span>
              <span className={classes("line", "height2", commonStyle.url)}>
                <span>{MUSIC_FILE_INFO_PROPS["timestamps.updatedAt"].caption}</span>
                <span className={commonStyle.content}>{f.timestamps.updatedAt.toISOString()}</span>
              </span>
              <span>
                <a onClick={async ()=> {
                  if (confirm(`Borar este archivo?\n${ JSON.stringify(f, null, 2)}`)) {
                    await fileInfosApi.deleteOneById(f.id);
                    removeFileInfo(f.id);
                  }
                }}>Borrar</a>
              </span>
            </Fragment>
          );
        } )
      }
      <FileUpload
        acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
        multiple={true}
        provideMetadata={()=> ( {
          musicId: data.id,
        } )}
        onUpload={genOnUpload( {
          url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
          // eslint-disable-next-line require-await
          onEachUpload: async (
            response: unknown,
            fileData: FileData,
            options: OnUploadOptions,
          )=> {
            const parsedResponse = MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(response);

            options?.setSelectedFiles?.((old)=> ([
              ...old.filter(f=> f.id !== fileData.id),
            ]));
            addFileInfo(parsedResponse.data.fileInfo);
          },
        } )}
      />
    </details>
    }
  </div>;
}

type OptionalPropsProps = Omit<ResourceInputCommonProps<MusicEntity, string>, "getUpdatedResource" |
  "getValue" | "name"> & {
  onPressEnter?: OnPressEnter<unknown>;
  optionalProps: Record<keyof Music, PropInfo>;
  initialResource: MusicEntity;
};
function OptionalProps(
  { resourceState, optionalProps, initialResource,
    addOnReset, onPressEnter }: OptionalPropsProps,
) {
  const [isVisible, setIsVisible] = useState(false);
  const ret: Record<string, JSX.Element> = {};

  ret.top = (<>
    <span className={classes("line", "height2")}>
      <a onClick={() => setIsVisible(!isVisible)}>{!isVisible

        ? "Mostrar"

        : "Ocultar"} todas las propiedades opcionales</a>
    </span>
  </>);

  const entries = Object.entries(optionalProps) as [keyof Music, PropInfo][];
  const commonProps = {
    resourceState,
    originalResource: initialResource,
    addOnReset,
    isOptional: true,
  };

  for (const entry of entries) {
    const [prop, propInfo] = entry;
    const { type, caption = prop } = propInfo;
    const isHidden = !(initialResource[prop] !== undefined
      || resourceState[0][prop] !== undefined || isVisible);
    const hiddenStyle = isHidden
      ? {
        display: "none",
      }
      : undefined;

    switch (type) {
      case "string":
        // eslint-disable-next-line default-case-last, no-fallthrough
      default:
        ret[prop] = (<>
          <span className={classes("line", "height2")} style={hiddenStyle}>
            {
              ResourceInputText( {
                ...commonProps,
                ...getAndUpdateMusicByProp<string>(prop),
                caption,
                onPressEnter,
                isHidden,
              } )
            }
          </span>
        </>);
        break;
      case "number":
        ret[prop] = (<>
          <span className={classes("line", "height2")} style={hiddenStyle}>
            {
              ResourceInputNumber( {
                ...commonProps,
                ...getAndUpdateMusicByProp<number>(prop),
                caption,
                onPressEnter,
                isHidden,
              } )
            }
          </span>
        </>);
        break;
      case "boolean":
        ret[prop] = (<>
          <span className={classes("line", "height2")} style={hiddenStyle}>
            {
              ResourceInputBoolean( {
                ...commonProps,
                ...getAndUpdateMusicByProp<boolean>(prop),
                caption,
                isHidden,
              } )
            }
          </span>
        </>);
    }
  }

  return <>
    {Object.entries(ret).map(([key, value]) => <span key={key}>{value}</span>)}
  </>;
}

function fullUrlOf(url: string) {
  return backendUrl(PATH_ROUTES.musics.slug.withParams(url));
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
