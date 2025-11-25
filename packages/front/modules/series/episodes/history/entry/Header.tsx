import { assertIsDefined } from "$shared/utils/validation";
import { createDurationElement, createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { EpisodeHistoryApi } from "../requests";
import headerStyles from "../../../../history/entry/Header/styles.module.css";

type HeaderProps = {
  entry: EpisodeHistoryApi.GetMany.Data;
  contextMenu?: ContextMenuProps;
};
export function Header( { entry, contextMenu }: HeaderProps) {
  const { resource } = entry;
  const { serie } = resource;

  assertIsDefined(resource);
  assertIsDefined(serie);
  const title = resource.title
    ? `${resource.title}`
    : resource.compKey.episodeKey
    ?? "(Sin título)";
  const subtitle = <>{resource.compKey.episodeKey} • {serie.name ?? resource.compKey.seriesKey}</>;
  const timeStampDate = new Date(entry.date.timestamp * 1000);
  const start = resource.fileInfos[0].start ?? 0;
  const end = resource.fileInfos[0].end ?? resource.fileInfos[0].mediaInfo.duration;
  const duration = end ? (end - start) : undefined;

  return <HistoryEntryHeader
    left={<>
      <span className={headerStyles.rows}>
        {createHistoryTimeElement(timeStampDate)}
      </span>
    </>}
    title={title}
    subtitle={subtitle}
    right={<>
      <span className={headerStyles.columns}>
        <span className={headerStyles.rows}>
          {duration && createDurationElement(duration)}
          {createWeightElement(resource.userInfo.weight)}
        </span>
        {contextMenu?.onClick
                      && <><SettingsButton
                        theme="dark"
                        onClick={(e: React.MouseEvent<HTMLElement>)=>contextMenu.onClick?.(e)}
                      />
                      {contextMenu.element}
                      </>}
      </span>
    </>} />;
}
