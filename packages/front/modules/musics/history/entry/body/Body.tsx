import type { Music } from "#modules/musics/models";
import type { MusicHistoryEntryEntity } from "../../models";
import type { PropInfo } from "$shared/utils/validation/zod";
import type { OnPressEnter } from "#modules/ui-kit/input/UseInputText";
import type { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { JSX, useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicFileInfoFetching } from "#modules/musics/file-info/requests";
import { LinkAsyncAction, ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { useHistoryEntryEdition } from "#modules/history/entry/useHistoryEntryEdition";
import { backendUrl } from "#modules/requests";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { MusicFetching } from "#modules/musics/requests";
import { ResourceInputBoolean } from "#modules/ui-kit/input/ResourceInputBoolean";
import { MUSIC_PROPS } from "../utils";
import { MusicHistoryEntryFetching } from "../../requests";
import { LastestComponent } from "./Lastest";
import style from "./style.module.css";

function getAndUpdateMusicByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      music: {
        ...r.music,
        [prop]: v,
      },
    } ),
    getValue: (r)=>r.music[prop],
    name: prop,

  };
}

type Data = MusicHistoryEntryFetching.GetManyByCriteria.Data;

type Props = {
  data: Data;
};
export function Body( { data }: Props) {
  const { state, remove, isModified,
    reset, addOnReset,
    update, initialState } = useHistoryEntryEdition<Data>( {
      data,
      isModifiedFn: calcIsModified,
      fetchRemove: async ()=> {
        const res = await MusicHistoryEntryFetching.DeleteOneById.fetch(data.id);

        return res.data as Data;
      },
      fetchUpdate: async () => {
        const body = generatePatchBody(
          data.music,
          state[0].music,
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
            "url",
            "year",
          ],
        );
        const promises: Promise<any>[] = [];

        if (shouldSendPatchWithBody(body)) {
          const p1 = MusicFetching.Patch.fetch(data.music.id, body)
            .then(res=>{
              const music = {
                ...res.data,
                fileInfos: state[0].music.fileInfos,
              };

              assertIsDefined(music.fileInfos);

              const newData = {
                ...state[0],
                music,
              };

              initialState[1](newData);
            } );

          promises.push(p1);
        }

        const dataFileInfo = data.music.fileInfos[0];
        const stateFileInfo = state[0].music.fileInfos[0];
        const fileInfoBody = generatePatchBody(
          dataFileInfo,
          stateFileInfo,
          ["path"],
        );

        if (Object.entries(fileInfoBody.entity).length > 0) {
          const p2 = MusicFileInfoFetching.Patch.fetch(stateFileInfo.id, fileInfoBody);

          promises.push(p2);
        }

        await Promise.all(promises);
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
  const { music } = state[0];
  const fileInfo = music.fileInfos[0];

  return <div className={style.container}>
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
        caption: <><a href={fullUrlOf(music.url)}>Url</a>:</>,
        ...getAndUpdateMusicByProp<string>("url"),
        ...commonInputProps,
      } )}
    </span>
    {(fileInfo.mediaInfo.duration !== null && <>
      <span className="line">Duration : {secsToMmss(fileInfo.mediaInfo.duration)}</span>
    </>) || null}
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
      {isModified && <span className={style.update}>{
        <LinkAsyncAction
          action={update.action as ()=> Promise<void>}
          isDoing={update.isDoing}
        >Update</LinkAsyncAction>
      }</span>}</span>
    <span className={"break"} />
    {
      remove
    && <>
      <span className={"line"}>
        <LinkAsyncAction
          action={remove.action as ()=> Promise<void>}
          isDoing={remove.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    <span className={"break"} />
    <LastestComponent resourceId={data.resourceId} date={data.date}/>
  </div>;
}

type OptionalPropsProps = Omit<ResourceInputCommonProps<Data, string>, "getUpdatedResource" |
  "getValue" | "name"> & {
  onPressEnter?: OnPressEnter<unknown>;
  optionalProps: Record<keyof Music, PropInfo>;
  initialResource: Data;
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
    const isHidden = !(initialResource.music[prop] !== undefined
      || resourceState[0].music[prop] !== undefined || isVisible);
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
  return backendUrl(PATH_ROUTES.musics.raw.withParams(url));
}

function calcIsModified(r1: MusicHistoryEntryEntity, r2: MusicHistoryEntryEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      music: {
        title: true,
        album: true,
        artist: true,
        country: true,
        disabled: true,
        game: true,
        tags: true,
        url: true,
        weight: true,
        year: true,
        fileInfos: true,
        spotifyId: true,
      },
    },
  } );
}
