import { Fragment, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { WithRequired } from "@tanstack/react-query";
import { PATH_ROUTES } from "$shared/routing";
import { JSX } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { logger } from "#modules/core/logger";
import { backendUrl } from "#modules/requests";
import { useListContextMenu } from "#modules/ui-kit/ContextMenu";
import { useModal } from "#modules/ui-kit/modal/useModal";
import { useUser } from "#modules/core/auth/useUser";
import { MusicsApi } from "../requests";
import { MusicEntity, MusicEntityWithFileInfos } from "../models";
import { PlaylistSelector } from "../playlists/list-selector/List";
import { useMusicPlaylistsForUser } from "../playlists/request-all";
import { PlaylistEntity } from "../playlists/Playlist";
import { MusicPlaylistsApi } from "../playlists/requests";
import { useNewPlaylistButton } from "../playlists/NewPlaylistButton";
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
  const { data, isLoading, error,
    setItem, observerTarget, totalCount } = useMusicList(props);
  const resultNumbers = <span style={{
    display: "flex",
    justifyContent: "left",
    marginTop: "0.5rem",
    marginLeft: "1rem",
    fontSize: "0.8em",
  }}>Resultados: {data?.length} de {totalCount}</span>;
  const userId = user?.id;
  let genAddToPlaylistElement: ((item: MusicEntity)=> JSX.Element) | undefined;

  if (userId) {
    let musicId: string;
    const { fetchData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Component: PlaylistSelectorComponent,
      newPlaylistButton } = usePlaylistSelector( {
      // TODO: gestión user = null
      userId: user!.id,
      onSelect: async (playlist)=> {
        const api = FetchApi.get(MusicPlaylistsApi);

        assertIsDefined(musicId);

        await api.addOneTrack(playlist.id, musicId);
        logger.info(`Canción añadida a "${playlist.name}"`);
        await closeModal();
      },
    } );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Modal, open: openModal, close: closeModal } = useModal( {
      title: "Añadir a playlist",
      onClose: ()=>closeMenu(),
      onOpen: ()=> fetchData(),
    } );

    genAddToPlaylistElement = (item) => {
      musicId = item.id;

      return <><p className={styles.contextMenuItem} onClick={(event)=> {
        event.stopPropagation();

        openModal();
      }}>Añadir a playlist</p>
      <Modal>
        <PlaylistSelectorComponent />
        <footer>
          {newPlaylistButton.element}
        </footer>
      </Modal></>;
    };
  }

  const { openMenu,
    renderContextMenu,
    closeMenu, activeIndex } = useListContextMenu( {
    renderChildren: (item: MusicEntity)=><>
      {genAddToPlaylistElement?.(item)}
      <p className={styles.contextMenuItem} onClick={async (event)=> {
        event.stopPropagation();
        await navigator.clipboard.writeText(
          backendUrl(PATH_ROUTES.musics.slug.withParams(item.slug)),
        );
        logger.info("Copiada url");

        closeMenu();
      }}>Copiar backend URL</p>
    </>,
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
        <br/>
        <span className={classes("resource-list", styles.list)}>
          {
          data!.map(
            (music, i) => <Fragment key={`${music.id}`}>
              <MusicEntryElement data={music} setData={
                (newData)=>setItem(i, newData as WithRequired<MusicEntityWithFileInfos, "userInfo">)
              }
              shouldFetchFileInfo={true}
              contextMenu={{
                element:
          activeIndex === i
            ? renderContextMenu(music as MusicEntity)
            : undefined,
                onClick: (e) => openMenu( {
                  event: e,
                  index: i,
                } ),
              }}
              />
            </Fragment>,
          )
          }
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
    expand: ["fileInfos", "userInfo"],
  };
  const { data, isLoading, error,
    setItem, observerTarget, fetchInitData } = useCrudDataWithScroll( {
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
          limitTimeoutRef.current = setTimeout(()=> {
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
    fetchInitData()
      .catch(showError);
  }, [props.filters]);

  return {
    data,
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

type UsePlaylistSelectorProps = {
  userId: string;
  onSelect?: (playlist: PlaylistEntity)=> void;
};
function usePlaylistSelector( { userId, onSelect }: UsePlaylistSelectorProps) {
  const { data,
    error,
    fetchData,
    isLoading } = useMusicPlaylistsForUser( {
    userId: userId,
  } );
  const newPlaylistButton = useNewPlaylistButton( {
    onSuccess: async (newPlaylist: PlaylistEntity) => {
        data!.push(newPlaylist);
        logger.debug("Nueva playlist creada: " + newPlaylist.name);

        await fetchData();
    },
  } );
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = genLazyFetchComponent( {
    fetching: {
      data,
      error,
      isLoading,
      fetchData,
    },
    renderComponent: (d)=> <PlaylistSelector
      data={d}
      onSelect={onSelect}
    />,
  } );

  return {
    Component,
    newPlaylistButton,
    fetchData,
  };
}

type UseLazyFetchComponentProps<T> = {
  fetching: {
    data: T;
    error: unknown;
    isLoading: boolean;
    fetchData: ()=> Promise<void>;
  };
  renderComponent: (data: NonNullable<T>)=> JSX.Element;
  };
function genLazyFetchComponent<T>( { fetching, renderComponent }: UseLazyFetchComponentProps<T>) {
  const { data,
    error,
    isLoading } = fetching;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = ()=>{
    if (isLoading)
      return <div>Cargando...</div>;

    if (!data)
      return <div>No hay playlists disponibles</div>;

    if (error)
      return <div>Error al cargar playlists</div>;

    return renderComponent(data);
  };

  return Component;
}

export async function sleep(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
