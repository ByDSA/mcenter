import React, { memo, ReactNode } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { HistoryTimeView, WeightView } from "#modules/history";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { SetState } from "#modules/utils/resources/useCrud";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { getLongDateStr } from "#modules/utils/dates";
import { EpisodeHistoryApi } from "../requests";
import { EpisodeLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { EditEpisodeContextMenuItem } from "../../EditEpisode/ContextMenu";
import { usePublishEpisodeEvent } from "../../EditEpisode/EditEpisode";
import styles from "./HistoryEntry.module.css";
import deleteEntryModalStyles from "./DeleteEntryModal.module.css";

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

  usePublishEpisodeEvent(episode);

  return ResourceEntry( {
    title: episode.title,
    subtitle: <EpisodeSubtitle episode={episode} />,
    right: <>
      <HistoryTimeView timestamp={value.date.timestamp} />
      <WeightView weight={episode.userInfo.weight} />
    </>,
    settings: {
      onClick: (e)=> {
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

                await navigator.clipboard.writeText(
                  backendUrl(
                    PATH_ROUTES.episodes.slug.withParams(seriesKey, episodeKey),
                  ),
                );
              }}
            />
            <EpisodeLatestViewsContextMenuItem
              episode={value.resource}
              episodeCompKey={value.resource.compKey}
              maxTimestamp={value.date.timestamp}
            />
            <DeleteHistoryEntryContextMenuItem value={value} setValue={setValue}/>
          </>,
        } );
      },
    },
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

type DeleteHistoryEntryModalContentWrapperProps = {
  children: ReactNode;
};
export function DeleteHistoryEntryModalContentWrapper(
  { children }: DeleteHistoryEntryModalContentWrapperProps,
) {
  return <span className={deleteEntryModalStyles.wrapper}><header>¿Borrar entrada?</header>
    <div>
      {children}
    </div>
  </span>;
}

function DeleteHistoryEntryContextMenuItem( { setValue, value }: Props<Data>) {
  const { openModal } = useConfirmModal();

  return <ContextMenuItem
    label="Quitar del historial"
    theme="danger"
    onClick={async () => {
      await openModal( {
        title: "Confirmar borrado",
        content: <DeleteHistoryEntryModalContentWrapper>
          <p>Fecha: {getLongDateStr(new Date(value.date.timestamp * 1_000), "datetime")}</p>
          <p>Serie: {value.resource.serie?.name ?? value.resource.compKey.seriesKey}</p>
          <p>Episodio: {value.resource.compKey.episodeKey}</p>
          <p>Título: {value.resource.title}</p>
        </DeleteHistoryEntryModalContentWrapper>,
        action: async ()=> {
          const api = FetchApi.get(EpisodeHistoryApi);

          await api.delete(value.id);
          logger.info("Quitada entrada de historial");
          setValue(undefined);

          return true;
        },
      } );
    }}
  />;
}
