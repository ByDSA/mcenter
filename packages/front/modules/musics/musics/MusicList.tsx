import { Fragment, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { WithRequired } from "@tanstack/react-query";
import { PATH_ROUTES } from "$shared/routing";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { logger } from "#modules/core/logger";
import { backendUrl } from "#modules/requests";
import { createContextMenuItem, useListContextMenu } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { MusicsApi } from "../requests";
import { MusicEntity, MusicEntityWithFileInfos } from "../models";
import { MusicPlaylistsApi } from "../playlists/requests";
import { usePlaylistSelectorModal } from "../playlists/list-selector/modal/Modal";
import { MusicEntryElement } from "./entry/MusicEntry";
import { ArrayData } from "./types";
import styles from "./styles.module.css";
import "#styles/resources/resource-list-entry.css";

type Props = {
  filters: {
    title?: string;
  };
};

type Data = ArrayData;

export function MusicList(props: Props) {
  const { user } = useUser();
  const { data,
    isLoading,
    error,
    setItem,
    observerTarget,
    totalCount } = useMusicList(props);
  const { openModal } = usePlaylistSelectorModal();
  const resultNumbers = (
    <span style={{
      display: "flex",
      justifyContent: "left",
      marginTop: "0.5rem",
      marginLeft: "1rem",
      fontSize: "0.8em",
    }}>
      Resultados: {data?.length} de {totalCount}
    </span>
  );
  const handleAddToPlaylist = (item: MusicEntity) => {
    if (!user)
      return;

    openModal( {
      className: styles.playlistSelectorModal,
      title: "Añadir a playlist",
      onSelect: async (playlist) => {
        if (!playlist)
          return;

        try {
          const api = FetchApi.get(MusicPlaylistsApi);

          await api.addOneTrack(playlist.id, item.id);
          logger.info(`Canción añadida a "${playlist.name}"`);
        } catch (err) {
          showError(err);
        }
      },
    } )
      .catch(showError);
  };
  const { openMenu, renderContextMenu, closeMenu, activeIndex } = useListContextMenu( {
    renderChildren: (item: MusicEntity) => (
      <>
        {user && createContextMenuItem( {
          label: "Añadir a playlist",
          onClick: (e) => {
            e.stopPropagation();
            closeMenu();
            handleAddToPlaylist(item);
          },
        } )
        }
        {
          createContextMenuItem( {
            label: "Copiar backend URL",
            onClick: async (event) => {
              event.stopPropagation();
              await navigator.clipboard.writeText(
                backendUrl(PATH_ROUTES.musics.slug.withParams(item.slug)),
              );
              logger.info("Copiada url");
              closeMenu();
            },
          } )
        }
      </>
    ),
  } );

  return renderFetchedData<Data | null>( {
    data,
    error,
    scroll: {
      observerRef: observerTarget,
    },
    isLoading,
    render: () => (
      <>
        {resultNumbers}
        <br />
        <span className={classes("resource-list", styles.list)}>
          {data!.map((music, i) => (
            <Fragment key={`${music.id}`}>
              <MusicEntryElement
                data={music}
                setData={(newData) => setItem(
                  i,
                  newData as WithRequired<MusicEntityWithFileInfos, "userInfo">,
                )
                }
                shouldFetchFileInfo={true}
                contextMenu={{
                  element: activeIndex === i ? renderContextMenu(music as MusicEntity) : undefined,
                  onClick: (e) => openMenu( {
                    event: e,
                    index: i,
                  } ),
                }}
              />
            </Fragment>
          ))}
        </span>
        {(data?.length ?? 0) > 10 && data?.length === totalCount && resultNumbers}
      </>
    ),
  } );
}

function useMusicList(props: Props) {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const limitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingMoreLimitRef = useRef<number>(5);
  const api = FetchApi.get(MusicsApi);
  const criteriaCommon: MusicsApi.GetManyByCriteria.Criteria = {
    sort: {
      added: "desc",
    },
    filter: getFilterFromProps(props),
    expand: ["fileInfos", "userInfo", "favorite"],
  };
  const { data,
    setData,
    isLoading,
    error,
    setItem, observerTarget,
    fetchInitData } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await api.getManyByCriteria( {
        limit: 20,
        ...criteriaCommon,
      } );
      const gotTotalCount = result.metadata?.totalCount;

      if (gotTotalCount !== undefined)
        setTotalCount(gotTotalCount);

      return result.data as Data;
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await api.getManyByCriteria( {
          limit: fetchingMoreLimitRef.current,
          offset: d?.length ?? 0,
          ...criteriaCommon,
        } );

        if (!limitTimeoutRef.current) {
          fetchingMoreLimitRef.current = 30;
          limitTimeoutRef.current = setTimeout(() => {
            fetchingMoreLimitRef.current = 15;
            limitTimeoutRef.current = null;
          }, 1000);
        }

        const gotTotalCount = result.metadata?.totalCount;

        if (gotTotalCount !== undefined)
          setTotalCount(gotTotalCount);

        return result.data as Data;
      },
    },
  } );

  useEffect(() => {
    fetchInitData().catch(showError);
  }, [props.filters]);

  return {
    data,
    setData,
    isLoading,
    error,
    totalCount,
    setItem,
    observerTarget,
  };
}

function getFilterFromProps(
  props: Props,
): MusicsApi.GetManyByCriteria.Criteria["filter"] | undefined {
  const ret: MusicsApi.GetManyByCriteria.Criteria["filter"] = {};

  if (props.filters.title)
    ret.title = props.filters.title;

  if (Object.entries(ret).length === 0)
    return undefined;

  return ret;
}

export async function sleep(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
