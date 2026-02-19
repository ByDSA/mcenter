import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { ShareContextMenuItem } from "#modules/resources/share/ShareLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";
import { musicIdInfoElement } from "#modules/musics/utils";

type CopyMusicMenuItemProps = {
  token?: string;
};

export const ShareMusicContextMenuItem = (props: CopyMusicMenuItemProps) => {
  const { data: music } = useLocalData<MusicEntity>();

  return (
    <ShareContextMenuItem
      buildUrl={( { includeToken, autoplay } ) => {
        return frontendUrl(
          PATH_ROUTES.musics.frontend.slug.withParams( {
            slug: music.slug,
            token: includeToken ? props.token : undefined,
            autoplay,
          } ),
        );
      }
      }
      showIncludeToken={!!props.token}
      showAutoplay
      topNode={musicIdInfoElement(music)}
    />
  );
};
