import { useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { logger } from "#modules/core/logger";
import { backendUrl } from "#modules/requests";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { AddToPlaylistContextMenuItem } from "#modules/musics/playlists/AddToPlaylistContextMenuItem";
import { Header } from "./Header";
import { Body, BodyProps } from "./body/Body";

type Props = Omit<BodyProps, "setData"> & Partial<Pick<BodyProps, "setData">>;
export function MusicEntryElement(
  props: Props,
) {
  const { data: music } = props;
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const updateIsFav = useCallback((_: string, favorite: boolean) => {
    if (props.data.isFav !== favorite) {
      props.setData?.( {
        ...props.data,
        isFav: favorite,
      } );
    }
  }, [props.setData, props.data]);
  const onClickMenu = useCallback((e)=> {
    openMenu( {
      event: e,
      content: (
        <>
          <AddToPlaylistContextMenuItem
            musicId={music.id}
            user={user}
          />
          <ContextMenuItem
            label="Copiar backend URL"
            onClick={async (event) => {
              event.stopPropagation();
              await navigator.clipboard.writeText(
                backendUrl(PATH_ROUTES.musics.slug.withParams(music.slug)),
              );
              logger.info("Copiada url");
            }}
          />
        </>
      ),
    } );
  }, []);

  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry: props.data,
          onClickMenu,
          updateFavButtons: updateIsFav,
        } ),
        bodyContent: Body( {
          ...props,
          // eslint-disable-next-line no-empty-function
          setData: props.setData ?? (()=>{ } ),
        } ),
      } )
    }
  </span>;
}
