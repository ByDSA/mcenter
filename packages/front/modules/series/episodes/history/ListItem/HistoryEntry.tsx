import React, { memo } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { HistoryTimeView, WeightView } from "#modules/history";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { backendUrl } from "#modules/requests";
import { SetState } from "#modules/utils/resources/useCrud";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { copyText } from "#modules/musics/lists/playlists/utils";
import { logger } from "#modules/core/logger";
import { EpisodeHistoryApi } from "../requests";
import { EpisodeLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { EditEpisodeContextMenuItem } from "../../EditEpisode/ContextMenu";
import { DeleteHistoryEntryContextMenuItem } from "../Delete/Delete";
import styles from "./HistoryEntry.module.css";

type Data = EpisodeHistoryApi.GetMany.Data;

type Props<T> = {
  value: T;
  setValue: SetState<T>;
  showDate?: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EpisodeHistoryEntryElement = React.memo((
  { value, setValue }: Props<Data>,
) =>{
  const { resource: episode } = value;
  const { openMenu } = useContextMenuTrigger();

  return ResourceEntry( {
    mainTitle: episode.title,
    subtitle: <EpisodeSubtitle episode={episode} />,
    right: <>
      <HistoryTimeView timestamp={value.date.timestamp} />
      <WeightView weight={episode.userInfo.weight} />
    </>,
    settings: <SettingsButton

      onClick={(e)=> {
        openMenu( {
          event: e,
          content: <>
            <EditEpisodeContextMenuItem initialData={value.resource} setData={(fnOrEntity)=>{
              setValue(oldData => {
                if (!oldData)
                  return;

                let entity: Data["resource"];

                if (typeof fnOrEntity === "function")
                  entity = fnOrEntity(oldData.resource) as Data["resource"];
                else
                  entity = fnOrEntity as Data["resource"];

                return ( {
                  ...oldData,
                  resource: {
                    ...oldData.resource,
                    ...entity,
                  },
                } );
              } );
            }}/>
            <ContextMenuItem
              label="Copiar backend URL"
              onClick={async (event) => {
                event.stopPropagation();
                const { episodeKey, seriesKey } = value.resource!.compKey;

                await copyText(
                  backendUrl(
                    PATH_ROUTES.episodes.slug.withParams(seriesKey, episodeKey),
                  ),
                );
                logger.info("Texto copiado.");
              }}
            />
            <EpisodeLatestViewsContextMenuItem
              episode={value.resource}
              episodeCompKey={value.resource.compKey}
              maxTimestamp={value.date.timestamp}
            />
            <DeleteHistoryEntryContextMenuItem
              value={value} setValue={setValue}
            />
          </>,
        } );
      }}
    />,
  } );
} );

type EpisodeSubtitleProps = {
  episode: EpisodeEntity;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EpisodeSubtitle = memo(( { episode }: EpisodeSubtitleProps) => {
  return <ResourceSubtitle items={[{
    text: episode.serie?.name!,
    className: classes(styles.subtitle, "ellipsis"),
  }, {
    text: episode.compKey.episodeKey,
    className: classes(styles.subtitle),
  }]} />;
} );
