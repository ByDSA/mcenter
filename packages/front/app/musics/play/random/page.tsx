"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { showError } from "$shared/utils/errors/showError";
import { useEffect } from "react";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useUser } from "#modules/core/auth/useUser";
import { useRequireActiveAction } from "#modules/utils/autoplay/useRequireActiveAction/useRequireActiveAction";

export default function PlaySmartPlaylistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const playSmartPlaylist = useBrowserPlayer((state) => state.playSmartPlaylist);
  const { action } = useRequireActiveAction( {
    action: ()=> playSmartPlaylist(q!),
    onFinally: ()=>router.push(redirectPage),
  } );
  const { user } = useUser();
  const redirectPage = user ? "/musics/playlists" : "/musics/searchssss";

  useEffect(() => {
    const fn = async () => {
      if (q)
        await action();
      else
        router.push(redirectPage);
    };

    fn().catch(showError);
  }, []);

  return null;
}
