import { useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { Music } from "$shared/models/musics";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { logger } from "#modules/core/logger";
import { frontendUrl } from "#modules/requests";
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
          {user && <AddToPlaylistContextMenuItem
            musicId={music.id}
            user={user}
          />
          }
          <ContextMenuItem
            label="Copiar URL"
            onClick={async (event) => {
              event.stopPropagation();
              await copyMusicUrl( {
                music,
                token: user?.id,
              } );
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

type CopyMusicProps = {
  music: Music;
  token?: string;
};
export async function copyMusicUrl( { music, token }: CopyMusicProps) {
  await navigator.clipboard.writeText(
    frontendUrl(
      PATH_ROUTES.musics.frontend.slug.withParams( {
        slug: music.slug,
        token: token,
      } ),
    ),
  );
  logger.info("Copiada url");
}
