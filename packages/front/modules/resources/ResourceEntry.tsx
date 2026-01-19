import { AnchorHTMLAttributes, Fragment, JSX, memo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ImageCover } from "$shared/models/image-covers";
import { classes } from "#modules/utils/styles";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayButtonView } from "#modules/player/browser/MediaPlayer/PlayButtonView";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { anchorOnClick } from "#modules/ui-kit/menus/TabsClient";
import styles from "./ListEntry.module.css";
import { ListEntryColumn, ListEntryRow } from "./ListEntry";
import { Separator } from "./Separator";

export type OnClickMenu = (e: React.MouseEvent<HTMLElement>)=> void;

export type ResourceEntryProps = {
  mainTitle: string;
  mainTitleHref?: string;
  href?: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  settings?: ReactNode;
  favButton?: JSX.Element;
  drag?: {
    isDragging: boolean;
    isDraggingGlobal: boolean;
    element: ReactNode;
  };
  play?: {
    onClick: (e: React.MouseEvent<HTMLElement>)=> Promise<void> | void;
    status: PlayerStatus;
  };
  imageCover?: ImageCover | null;
};

export function ResourceEntry(
  { mainTitle, subtitle, settings, right, favButton, play, drag, imageCover,
    mainTitleHref, href }: ResourceEntryProps,
) {
  const shouldHaveLeftDiv = !!play || imageCover !== undefined;
  const isPlaying = play !== undefined && play.status !== "stopped";
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Tag = href ? "a" : "span";

  return <span
    className={classes(
      styles.container,
      isPlaying && styles.playing,
      drag?.isDragging && styles.dragging,
    )}
  >
    {drag?.element}
    {shouldHaveLeftDiv && (
      <div className={styles.leftDiv}>
        <MusicImageCover
          className={classes(styles.cover)}
          size="small"
          cover={imageCover}
        />
        {play && <PlayButtonView
          theme="triangle-white"
          className={classes(styles.playButton)}
          onClick={play.onClick}
          status={play.status}
        />
        }
      </div>
    )}
    <Tag
      className={classes(styles.main, !shouldHaveLeftDiv && styles.noLeftDiv)}
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
    </Tag>
    <ListEntryRow className={styles.right}>
      {favButton}
      {right && <ListEntryColumn className={classes(styles.small, styles.info)}>
        {right}
      </ListEntryColumn>
      }
      {settings}
    </ListEntryRow>
  </span>;
}

type ResourceSubtitleProps = {
  className?: string;
  items: ( {
    text: string;
    customContent?: ReactNode;
    className?: string;
    separatorClassName?: string;
  } | undefined)[];
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResourceSubtitle = memo(( { items, className }: ResourceSubtitleProps) => {
  const title = items.reduce((acc, item) => {
    if (!item?.text)
      return acc;

    return acc + (acc !== "" ? " • " : "") + item?.text;
  }, "");

  return <ListEntryRow className={classes(styles.subtitle, "ellipsis", className)}>

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
  </ListEntryRow>;
} );

type ResourceTitleProps = AnchorHTMLAttributes<HTMLAnchorElement>;
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResourceTitle = (props: ResourceTitleProps) => {
  const router = useRouter();
  const { onClick: onClickProp, href, children, ...otherProps } = props;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const TitleTag = href ? "a" : "span";
  let onClick: ResourceTitleProps["onClick"];

  if (onClickProp)
    onClick = onClickProp;
  else if (href) {
    onClick = anchorOnClick( {
      href,
      router,
    } );
  }

  return <TitleTag className={classes(styles.title, "ellipsis")}
    {...otherProps}
    href={href}
    onClick={onClick}
  >{children ?? props.title ?? "Title"}
  </TitleTag>;
};
