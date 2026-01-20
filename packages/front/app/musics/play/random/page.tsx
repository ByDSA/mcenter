"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { showError } from "$shared/utils/errors/showError";
import { useEffect } from "react";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { useUser } from "#modules/core/auth/useUser";
import styles from "./Page.module.css";

export default function PlaySmartPlaylistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const playSmartPlaylist = useBrowserPlayer((state) => state.playSmartPlaylist);
  const modal = useModal();
  const { user } = useUser();
  const redirectPage = user ? "/musics/playlists" : "/musics/searchssss";

  useEffect(() => {
    const fn = async () => {
      if (q) {
        if (navigator.userActivation.hasBeenActive)
          await playSmartPlaylist(q);
        else {
          await modal.openModal( {
            showBox: false,
            onClose: async ()=> {
              await playSmartPlaylist(q!).catch(showError);
              router.push(redirectPage);
            },
            content: <>
              <Button
                className={styles.button}
                theme="blue"
                onClick={async ()=> {
                  await playSmartPlaylist(q!).catch(showError);
                  modal.closeModal();
                }}><p>Click para</p><p>Reproducir música</p></Button>
            </>,
          } );
        }
      } else
        router.push(redirectPage);
    };

    fn().catch(showError);
  }, []);

  return null;
}
