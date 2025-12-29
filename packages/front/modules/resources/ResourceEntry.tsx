import { Fragment, JSX, memo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { classes } from "#modules/utils/styles";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayButtonView } from "#modules/player/browser/MediaPlayer/PlayButtonView";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { anchorOnClick } from "#modules/ui-kit/menus/TabsClient";
import styles from "./ListEntry.module.css";
import { ListEntryColumn, ListEntryRow } from "./ListEntry";

export type OnClickMenu = (e: React.MouseEvent<HTMLElement>)=> void;

export type ResourceEntryProps = {
  title: string;
  titleHref?: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  settings?: {
    onClick: OnClickMenu;
  };
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
  index?: number;
  coverUrl?: string;
};

export function ResourceEntry(
  { title, subtitle, settings, right, favButton, play, drag, index, coverUrl,
    titleHref }: ResourceEntryProps,
) {
  const router = useRouter();
  const shouldHaveLeftDiv = !!play || index !== undefined;
  const isPlaying = play !== undefined && play.status !== "stopped";
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const TitleTag = titleHref ? "a" : "span";

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
          img={{
            alt: "Cover",
            url: coverUrl,
          }}
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
    <span className={classes(styles.main, !shouldHaveLeftDiv && styles.noLeftDiv)}>
      <TitleTag className={classes(styles.title, "ellipsis")}
        title={title}
        href={titleHref}
        onClick={titleHref
          ? anchorOnClick( {
            href: titleHref,
            router,
          } )
          : undefined}
      >{title}
      </TitleTag>
      {subtitle}
    </span>
    <ListEntryRow className={styles.right}>
      {favButton}
      {right && <ListEntryColumn className={classes(styles.small, styles.info)}>
        {right}
      </ListEntryColumn>
      }
      {settings
        && <><SettingsButton
          theme="dark"
          onClick={(e: React.MouseEvent<HTMLElement>)=>settings!.onClick(e)}
        />
        </>}
    </ListEntryRow>
  </span>;
}

type ResourceSubtitleProps = {
  className?: string;
  items: ( {
    text: string;
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
        && <span key={"sep" + i}
          className={classes(styles.separator, item?.separatorClassName)}>•</span>}
        <span
          key={i}
          className={item!.className}
          title={title}
        >{item!.text}</span>
      </Fragment>;
    } )}
  </ListEntryRow>;
} );
