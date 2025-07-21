import { JSX, useState } from "react";
import { PropInfo } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { Music } from "#modules/musics/models";
import { LinkAsyncAction, ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { useHistoryEntryEdition } from "#modules/history";
import { backendUrl } from "#modules/requests";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { InputNumberProps } from "#modules/ui-kit/input/InputNumber";
import { InputTextProps } from "#modules/ui-kit/input/InputText";
import { generatePatchBody } from "#modules/fetching";
import { MusicFetching } from "#modules/musics/requests";
import { MusicFileInfoFetching } from "#modules/musics/file-info/requests";
import { MUSIC_PROPS } from "../utils";
import { MusicHistoryEntryEntity } from "../../models";
import { MusicHistoryEntryFetching } from "../../requests";
import style from "./style.module.css";
import { LastestComponent } from "./Lastest";

function getAndUpdateMusicByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getValue" | "name" | "setResource"> {
  return {
    setResource: (v, r) => ( {
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
  const { state, remove, isModified, reset, update } = useHistoryEntryEdition<
 Data
   >( {
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
         ["title", "weight", "disabled", "tags"],
       );
       const promises: Promise<any>[] = [];

       if (Object.entries(body.entity).length > 0) {
         const p1 = MusicFetching.Patch.fetch(data.id, body);

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
  const commonInputTextProps = {
    inputTextProps: {
      onPressEnter: ()=>update.action(),
    },
    resourceState: state,
  };
  const commonInputNumberProps = {
    inputNumberProps: {
      onPressEnter: ()=>update.action(),
    },
    resourceState: state,
  };
  const titleElement = ResourceInputText( {
    caption: MUSIC_PROPS.title.caption,
    ...getAndUpdateMusicByProp("title"),
    ...commonInputTextProps,
  } );
  const artistElement = ResourceInputText( {
    caption: MUSIC_PROPS.artist.caption,
    ...getAndUpdateMusicByProp("artist"),
    ...commonInputTextProps,
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
          ...commonInputNumberProps,
        } )}
      </span>
      <span className={classes("height2", style.album)}>
        {ResourceInputText( {
          caption: MUSIC_PROPS.album.caption,
          ...getAndUpdateMusicByProp<string>("album"),
          ...commonInputTextProps,
        } )}
      </span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{MUSIC_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        ...getAndUpdateMusicByProp<string[]>("tags"),
        resourceState: state,
        inputTextProps: {
          onEmptyPressEnter: commonInputTextProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInputText( {
        caption: <><a href={fullUrlOf(music.url)}>Url</a>:</>,
        ...getAndUpdateMusicByProp<string>("url"),
        ...commonInputTextProps,
      } )}
    </span>
    {(fileInfo.mediaInfo.duration !== null && <>
      <span className="line">Duration : {secsToMmss(fileInfo.mediaInfo.duration)}</span>
    </>) || null}
    {OptionalProps( {
      optionalProps,
      ...commonInputTextProps,
      ...commonInputNumberProps,
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

type OptionalPropsProps = Omit<ResourceInputCommonProps<Data, string>, "getValue" | "name" |
  "setResource"> & {
  optionalProps: Record<keyof Music, PropInfo>;
  inputNumberProps: InputNumberProps;
  inputTextProps: InputTextProps;
};
function OptionalProps(
  { resourceState, optionalProps, inputNumberProps, inputTextProps }: OptionalPropsProps,
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

  const [resource] = resourceState;
  const entries = Object.entries(optionalProps) as [keyof Music, PropInfo][];

  for (const entry of entries) {
    const [prop, propInfo] = entry;
    const { type, caption = prop } = propInfo;

    if (prop in resource || isVisible) {
      const t = type === "number" ? "number" : "string";

      switch (t) {
        case "string":
        // eslint-disable-next-line default-case-last, no-fallthrough
        default:
          ret[prop] = (<>
            <span className={classes("line", "height2")}>
              {
                ResourceInputText( {
                  caption,
                  ...getAndUpdateMusicByProp(prop),
                  resourceState,
                  isOptional: true,
                  inputTextProps,
                } )
              }
            </span>
          </>);
          break;
        case "number":
          ret[prop] = (<>
            <span className={classes("line", "height2")}>
              {
                ResourceInputNumber( {
                  caption,
                  ...getAndUpdateMusicByProp<number>(prop),
                  resourceState,
                  isOptional: true,
                  inputNumberProps,
                } )
              }
            </span>
          </>);
      }
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
  } );
}
