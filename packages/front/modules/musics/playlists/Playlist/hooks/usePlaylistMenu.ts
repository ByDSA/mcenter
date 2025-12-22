import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useUser } from "#modules/core/auth/useUser";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { playlistCopySlugUrl } from "../../utils";
import { PlaylistEntity } from "../types";

export const usePlaylistMenu = (
  value: PlaylistEntity,
) => {
  const router = useRouter();
  const { user } = useUser();
  const { openMenu, closeMenu } = useContextMenuTrigger();
  const copyLink = async () => {
    const userSlug = value.ownerUserPublic?.slug;

    assertIsDefined(userSlug);
    await playlistCopySlugUrl( {
      userSlug,
      playlistSlug: value.slug,
      token: user?.id,
    } );
  };
  const navigateToRenamed = (newSlug: string, userSlug: string) => {
    router.push(
      PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
        playlistSlug: newSlug,
        userSlug,
      } ),
    );
  };
  const handleDeleteSuccess = () => {
    router.push(PATH_ROUTES.musics.frontend.playlists.path);
  };

  return {
    user,
    openMenu,
    closeMenu,
    copyLink,
    navigateToRenamed,
    handleDeleteSuccess,
  };
};
