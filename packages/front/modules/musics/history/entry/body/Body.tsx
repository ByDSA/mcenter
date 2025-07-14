import { JSX, useState } from "react";
import { PropInfo } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { Music, assertIsMusic } from "#modules/musics/models";
import { MusicHistoryEntry } from "#modules/musics/history/models";
import { LinkAsyncAction, ResourceInput, ResourceInputArrayString, ResourceInputProps } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { useHistoryEntryEdition } from "#modules/history";
import { backendUrl } from "#modules/requests";
import { MUSIC_PROPS } from "../utils";
import { fetchPatch } from "../../../requests";
import { fetchDelete } from "../../requests";
import style from "./style.module.css";
import { LastestComponent } from "./Lastest";

function generatePatchBody(entryResource: Music, resource: Music) {
  const patchBodyParams = getDiff(
    entryResource,
    resource,
  );

  return patchBodyParams;
}

type Props = {
  entry: Required<MusicHistoryEntry>;
};
export function Body( { entry }: Props) {
  const { resource: resourceRet, delete: deleteEntry } = useHistoryEntryEdition( {
    resource: {
      calcIsModified,
      entry,
      assertionFn: assertIsMusic,
      fetching: {
        patch: {
          fetch: fetchPatch,
          generateBody: generatePatchBody,
        },
      },
    },
    delete: {
      fetch: (_: string, id: string) => fetchDelete(id),
    },
  } );
  const { isModified,
    update: { action: update, isDoing: isUpdating }, errors,
    resourceState, reset } = resourceRet;
  const [resource] = resourceState;
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
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const commonInputNumberProps = {
    inputNumberProps: {
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const titleElement = ResourceInput( {
    caption: MUSIC_PROPS.title.caption,
    prop: "title",
    error: errors?.title,
    ...commonInputTextProps,
  } );
  const artistElement = ResourceInput( {
    caption: MUSIC_PROPS.artist.caption,
    prop: "artist",
    error: errors?.artist,
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

  return <div className={style.container}>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}

    <span className={classes("line", style.weightAlbum)}>
      <span className={classes("height2", style.weight)}>
        {ResourceInput( {
          caption: MUSIC_PROPS.weight.caption,
          type: "number",
          prop: "weight",
          ...commonInputNumberProps,
        } )}
      </span>
      <span className={classes("height2", style.album)}>
        {ResourceInput( {
          caption: MUSIC_PROPS.album.caption,
          prop: "album",
          ...commonInputTextProps,
        } )}
      </span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{MUSIC_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        prop: "tags",
        resourceState,
        inputTextProps: {
          onEmptyPressEnter: commonInputTextProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInput( {
        caption: MUSIC_PROPS.path.caption,
        prop: "path",
        ...commonInputTextProps,
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInput( {
        caption: <><a href={fullUrlOf(resource.url)}>Url</a>:</>,
        prop: "url",
        ...commonInputTextProps,
      } )}
    </span>
    {(resource.mediaInfo.duration && resource.mediaInfo.duration > 0 && <>
      <span className="line">Duration : {secsToMmss(resource.mediaInfo.duration)}</span>
    </>) || null}
    {OptionalProps( {
      optionalProps,
      errors,
      ...commonInputTextProps,
      ...commonInputNumberProps,
    } )}

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span className={style.update}>{
        <LinkAsyncAction action={update} isDoing={isUpdating}>Update</LinkAsyncAction>
      }</span>}</span>
    <span className={"break"} />
    {
      deleteEntry
    && <>
      <span className={"line"}>
        <LinkAsyncAction
          action={deleteEntry.action}
          isDoing={deleteEntry.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    <span className={"break"} />
    <LastestComponent resourceId={entry.resourceId} date={entry.date}/>
  </div>;
}

type OptionalPropsProps = Omit<ResourceInputProps<Music>, "prop"> & {
  optionalProps: Record<keyof Music, PropInfo>;
  errors?: Record<keyof Music, string>;
};
function OptionalProps(
  { resourceState, optionalProps, errors, inputNumberProps, inputTextProps }: OptionalPropsProps,
) {
  const [isVisible, setIsVisible] = useState(false);
  const ret: Record<string, JSX.Element> = {};

  ret.top = (<>
    <span className={classes("line", "height2")}>
      <a onClick={() => setIsVisible(!isVisible)}>{!isVisible ? "Mostrar" : "Ocultar"} todas las propiedades opcionales</a>
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
              <ResourceInput caption={caption}
                type={t} prop={prop}
                resourceState={resourceState}
                isOptional
                error={errors?.[prop]} inputTextProps={inputTextProps}/>
            </span>
          </>);
          break;
        case "number":
          ret[prop] = (<>
            <span className={classes("line", "height2")}>
              <ResourceInput
                caption={caption} type={t} prop={prop}
                resourceState={resourceState}
                isOptional error={errors?.[prop]} inputNumberProps={inputNumberProps}/>
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

function calcIsModified(r1: Music, r2: Music) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}
