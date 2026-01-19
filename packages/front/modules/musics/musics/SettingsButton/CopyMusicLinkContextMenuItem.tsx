import { MusicEntity, Music } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { CopyLinkContextMenuItem } from "#modules/musics/lists/CopyLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";

type CopyMusicMenuItemProps = {
  token?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CopyMusicLinkContextMenuItem = (props: CopyMusicMenuItemProps) => {
  const { data: music } = useLocalData<MusicEntity>();

  return <CopyLinkContextMenuItem
    txt={genMusicUrl( {
      music: music,
      token: props.token,
    } )}
  />;
};

type CopyMusicProps = {
  music: Music;
  token?: string;
};
function genMusicUrl( { music, token }: CopyMusicProps) {
  return frontendUrl(
    PATH_ROUTES.musics.frontend.slug.withParams( {
      slug: music.slug,
      token: token,
    } ),
  );
}
