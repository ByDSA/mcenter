import { assertIsDefined } from "$shared/utils/validation";
import { createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { classes } from "#modules/utils/styles";
import { OnClickMenu } from "#modules/musics/history/entry/Header";
import { EpisodeHistoryApi } from "../requests";
import headerStyles from "../../../../history/entry/Header/styles.module.css";

type HeaderProps = {
  entry: EpisodeHistoryApi.GetMany.Data;
  onClickMenu?: OnClickMenu;
};
export function Header( { entry, onClickMenu }: HeaderProps) {
  const { resource } = entry;
  const { serie } = resource;

  assertIsDefined(resource);
  assertIsDefined(serie);
  const title = resource.title
    ? `${resource.title}`
    : resource.compKey.episodeKey
    ?? "(Sin título)";
  const subtitle = <>{serie.name ?? resource.compKey.seriesKey} • {resource.compKey.episodeKey}</>;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return <HistoryEntryHeader
    left={<>
      <span className={headerStyles.rows}>
      </span>
    </>}
    title={title}
    subtitle={subtitle}
    right={<>
      <span className={headerStyles.columns}>
        <span className={classes(headerStyles.rows, headerStyles.small, headerStyles.info)}>
          {createHistoryTimeElement(timeStampDate)}
          {createWeightElement(resource.userInfo.weight)}
        </span>
        {onClickMenu && <><SettingsButton
          theme="dark"
          onClick={(e: React.MouseEvent<HTMLElement>)=>onClickMenu?.(e)}
        />
        </>}
      </span>
    </>} />;
}
