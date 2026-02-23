import { AnchorHTMLAttributes, ComponentProps, Fragment, JSX, memo, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ImageCover } from "$shared/models/image-covers";
import { PropsXOR } from "$shared/utils/types";
import { classes } from "#modules/utils/styles";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayButtonView } from "#modules/player/common/PlayButtonView";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { anchorOnClick } from "#modules/ui-kit/menus/TabsClient";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { Separator } from "../Separator/Separator";
import styles from "./ListItem.module.css";
import { ListItemColumn, ListItemRow } from "./ListItem";

export type OnClickMenu = (e: React.MouseEvent<HTMLElement>)=> void;

export type ResourceEntryProps = {
  mainTitle: string;
  mainTitleHref?: string;
  href?: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  settings?: ReactNode;
  favButton?: JSX.Element;
  disabled?: boolean;
  drag?: {
    isDragging: boolean;
    isDraggingGlobal: boolean;
    element: ReactNode;
  };
  play?: {
    onClick: (e: React.MouseEvent<HTMLElement>)=> Promise<void> | void;
    status: PlayerStatus | "disabled";
  };
  imageCover?: ImageCover | null;
  imageCoverDefaultIcon?: NonNullable<ComponentProps<typeof MusicImageCover>>["icon"];
};

export function ResourceEntry(
  { mainTitle, subtitle, settings, right, favButton, play, drag, imageCover,
    mainTitleHref, imageCoverDefaultIcon, href, disabled }: ResourceEntryProps,
) {
  const shouldHaveLeftDiv = !!play || imageCover !== undefined;
  const isPlaying = play !== undefined && play.status !== "stopped" && play.status !== "disabled";
  const router = useRouter();
  const isAvailable = !(disabled || play?.status === "disabled");

  return <span
    className={classes(
      styles.container,
      isPlaying && styles.playing,
      drag?.isDragging && styles.dragging,
      play && styles.isPlayable,
      isAvailable && styles.isAvailable,
    )}
  >
    {drag?.element}
    {shouldHaveLeftDiv && (
      <div className={styles.leftDiv}>
        <MusicImageCover
          className={classes(styles.cover)}
          size="small"
          icon={imageCoverDefaultIcon}
          cover={imageCover}
          disabled={!isAvailable}
        />
        {play && <PlayButtonView
          theme="triangle-white"
          className={classes(styles.playButton)}
          onClick={play.onClick}
          disabled={play.status === "disabled"}
          status={play.status === "disabled" ? "stopped" : play.status}
        />
        }
      </div>
    )}
    <DaAnchor
      theme="text"
      disabled={disabled}
      className={
        classes(
          styles.main,
          !shouldHaveLeftDiv && styles.noLeftDiv,
        )}
      href={href}
      onClick={href
        ? (e)=> {
          anchorOnClick( {
            href,
            router,
          } )(e);
        }
        : undefined}
    >
      <ResourceTitle title={mainTitle} href={mainTitleHref} />
      {subtitle}
    </DaAnchor>
    <ListItemRow className={styles.right}>
      {favButton}
      {right && <ListItemColumn className={classes(styles.small, styles.info)}>
        {right}
      </ListItemColumn>
      }
      {settings}
    </ListItemRow>
  </span>;
}

type Item = PropsXOR<{
  text: string;
}, {
  customContent: ReactNode;
}> & {
  className?: string;
  separatorClassName?: string;
} & {title?: string};
type ResourceSubtitleProps = {
  className?: string;
  title?: string;
  items: (Item | undefined)[];
};
export const ResourceSubtitle = memo(( { title: paramTitle,
  items,
  className }: ResourceSubtitleProps) => {
  const title = paramTitle ?? useMemo(()=>items.reduce((acc, item) => {
    const titlePart = item?.title ?? item?.text;

    if (!titlePart)
      return acc;

    return acc + (acc !== "" ? " • " : "") + titlePart;
  }, ""), [items]);

  return <ListItemRow className={classes(styles.subtitle, "ellipsis", className)}>

    {items.filter(Boolean).map((item, i) => {
      return <Fragment key={i}>
        {i > 0
        && <Separator
          key={"sep" + i}
          collapsable={false}
          className={classes(item?.separatorClassName)}/>
        }
        <span
          key={i}
          className={item!.className}
          title={title}
        >{item!.customContent ?? item!.text}</span>
      </Fragment>;
    } )}
  </ListItemRow>;
} );

type ResourceTitleProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  disabled?: boolean;
};
export const ResourceTitle = (props: ResourceTitleProps) => {
  const router = useRouter();
  const { onClick: onClickProp, href, children, disabled, ...otherProps } = props;
  let onClick: ResourceTitleProps["onClick"];

  if (onClickProp)
    onClick = onClickProp;
  else if (href) {
    onClick = anchorOnClick( {
      href,
      router,
    } );
  }

  return <DaAnchor className={classes(styles.title, "ellipsis")}
    {...otherProps}
    disabled={disabled}
    href={href}
    onClick={onClick}
  >{children ?? props.title ?? "Title"}
  </DaAnchor>;
};
