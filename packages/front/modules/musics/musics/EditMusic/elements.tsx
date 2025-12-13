import { MusicEntity } from "$shared/models/musics";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import { WithRequired } from "$shared/utils/objects/types";
import { ResourceInputText, ResourceInputNumber, ResourceInputArrayString } from "#modules/ui-kit/input";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { ResourceInputBoolean } from "#modules/ui-kit/input/ResourceInputBoolean";
import { classes } from "#modules/utils/styles";
import { Data } from "../types";
import { MUSIC_PROPS, MUSIC_USER_INFO_PROPS } from "../MusicEntry/utils";
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
function getAndUpdateMusicUserInfoByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      userInfo: {
        ...r.userInfo,
        [prop]: v,
      },
    } ),
    getValue: (r)=>r.userInfo[prop],
    name: prop,
  };
}

type F = (...args: any[])=> any;
type ElementProps<I extends F> =
  WithRequired<
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
      caption: MUSIC_USER_INFO_PROPS.weight.caption,
      ...getAndUpdateMusicUserInfoByProp<number>("weight"),
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
      caption: MUSIC_PROPS.slug.caption,
      ...getAndUpdateMusicByProp<string>("slug"),
      ...props,
    } )
  }</span>;
}

export function genTagsElement(props: TextArrayProps) {
  return <span className={styles.tags}>{
    ResourceInputArrayString( {
      caption: MUSIC_PROPS.tags.caption,
      getUpdatedResource: (v, r) => ( {
        ...r,
        tags: v?.filter(t=>t.startsWith("#")),
        userInfo: r.userInfo
          ? {
            ...r.userInfo,
            tags: v?.filter(t=>!t.startsWith("#")),
          }
          : undefined,
      } ),
      getValue: (r)=>[...r.tags ?? [], ...r.userInfo?.tags ?? []],
      name: "tags",
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

type OptionalPropsButtonProps = {
  onClick: ()=> void;
  isVisible: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OptionalPropsButton = ( { isVisible, onClick }: OptionalPropsButtonProps)=><span
  onClick={onClick}
  className={classes("line", "height2", styles.optionalButton)}>
  {!isVisible ? <ArrowRight /> : <ArrowDropDown />} Propiedades opcionales</span>;
