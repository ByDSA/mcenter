import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { ResourceInputText, ResourceInputNumber, ResourceInputArrayString } from "#modules/ui-kit/input";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { ResourceInputBoolean } from "#modules/ui-kit/input/ResourceInputBoolean";
import { classes } from "#modules/utils/styles";
import { Data } from "../../types";
import { MUSIC_PROPS } from "../utils";
import styles from "./styles.module.css";

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

type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

type F = (...args: any[])=> any;
type ElementProps<I extends F> =
  RequireFields<
  Partial<Parameters<I>[0]>,
  "originalResource" | "resourceState"
  >;
type TextProps = ElementProps<typeof ResourceInputText<MusicEntity>>;
type TextArrayProps = ElementProps<typeof ResourceInputArrayString<MusicEntity>>;
type NumberProps = ElementProps<typeof ResourceInputNumber<MusicEntity>>;
type BooleanProps = ElementProps<typeof ResourceInputBoolean<MusicEntity>>;
export function genTitleElement(props: TextProps) {
  return <span className={styles.title}>{
    ResourceInputText( {
      caption: MUSIC_PROPS.title.caption,
      ...getAndUpdateMusicByProp<string>("title"),
      ...props,
    } )
  }</span>;
}

export function genArtistElement(props: TextProps) {
  return <span className={styles.artist}>{
    ResourceInputText( {
      caption: MUSIC_PROPS.artist.caption,
      ...getAndUpdateMusicByProp<string>("artist"),
      ...props,
    } )
  }</span>;
}

export function genWeightElement(props: NumberProps) {
  return <span className={styles.weight}>{
    ResourceInputNumber<MusicEntity>( {
      caption: MUSIC_PROPS.weight.caption,
      ...getAndUpdateMusicByProp<number>("weight"),
      ...props,
    } )
  }</span>;
}

export function genAlbumElement(props: TextProps) {
  return <span className={styles.album}>{
    ResourceInputText<MusicEntity>( {
      caption: MUSIC_PROPS.album.caption,
      ...getAndUpdateMusicByProp<string>("album"),
      ...props,
      isOptional: true,
    } )
  }</span>;
}

export function genSlugElement(props: TextProps) {
  return <span className={classes(styles.url)}>{
    ResourceInputText<MusicEntity>( {
      caption: <><a href={fullUrlOf(props.resourceState[0].slug)}>Url</a>:</>,
      ...getAndUpdateMusicByProp<string>("slug"),
      ...props,
    } )
  }</span>;
}

export function genTagsElement(props: TextArrayProps) {
  return <span className={styles.tags}>{
    ResourceInputArrayString( {
      caption: MUSIC_PROPS.tags.caption,
      ...getAndUpdateMusicByProp<string[]>("tags"),
      // eslint-disable-next-line no-empty-function
      addOnReset: ()=>{},
      ...props,
    } )
  }</span>;
}

export function genUnknownElement(
  type: string,
  prop: string,
  props: BooleanProps | NumberProps | TextProps,
) {
  switch (type) {
    case "string":
    // eslint-disable-next-line default-case-last, no-fallthrough
    default:
      return ResourceInputText( {
        ...getAndUpdateMusicByProp<string>(prop),
        ...(props as TextProps),
      } );
    case "number":
      return ResourceInputNumber( {
        ...getAndUpdateMusicByProp<number>(prop),
        ...(props as NumberProps),
      } );
    case "boolean":
    {
      const { onPressEnter, ...booleanProps } = props as TextProps;

      return ResourceInputBoolean( {
        ...getAndUpdateMusicByProp<boolean>(prop),
        ...(booleanProps as BooleanProps),
      } );
    }
  }
}

function fullUrlOf(url: string) {
  return backendUrl(PATH_ROUTES.musics.slug.withParams(url));
}

type OptionalPropsButtonProps = {
  onClick: ()=> void;
  isVisible: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OptionalPropsButton = ( { isVisible, onClick }: OptionalPropsButtonProps)=><span
  onClick={onClick}
  className={classes("line", "height2", styles.optionalButton)}>
  {!isVisible ? "▼" : "▲"} Propiedades opcionales</span>;
