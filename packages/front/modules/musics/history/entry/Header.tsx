import { isDefined } from "$shared/utils/validation";
import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { createDurationElement, createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import headerStyles from "../../musics/entry/Header.module.css";

type HeaderProps = {
  entry: Omit<MusicHistoryEntryEntity, "resource"> & {
    resource: MusicEntityWithUserInfo;
  };
  contextMenu?: ContextMenuProps;
};
export function Header( { entry, contextMenu }: HeaderProps) {
  const { resource } = entry;
  const { title } = resource;
  const duration = resource.fileInfos?.[0].mediaInfo.duration;
  const subtitle = resource.game ?? resource.artist;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return HistoryEntryHeader( {
    left: <>
      <span className={headerStyles.rows}>
        {createHistoryTimeElement(timeStampDate)}
      </span>
    </>,
    title,
    subtitle,
    right: <>
      <span className={headerStyles.columns}>
        <span className={headerStyles.rows}>
          {isDefined(duration) && createDurationElement(duration)}
          {createWeightElement(resource.userInfo.weight) }
        </span>
        {contextMenu?.onClick
              && <><SettingsButton
                theme="dark"
                onClick={(e: React.MouseEvent<HTMLElement>)=>contextMenu.onClick?.(e)}
              />
              {contextMenu.element}
              </>}
      </span>
    </>,
  } );
}
