"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { showError } from "$shared/utils/errors/showError";
import { useEffect } from "react";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/input/Button";
import { useUser } from "#modules/core/auth/useUser";
import styles from "./Page.module.css";

export default function PlayQueryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const playQuery = useBrowserPlayer((state) => state.playQuery);
  const modal = useModal();
  const { user } = useUser();
  const redirectPage = user ? "/musics/history" : "/musics/search";

  useEffect(() => {
    const fn = async () => {
      if (q) {
        if (navigator.userActivation.hasBeenActive)
          await playQuery(q);
        else {
          await modal.openModal( {
            showBox: false,
            onClose: async ()=> {
              await playQuery(q!).catch(showError);
              router.push(redirectPage);
            },
            content: <>
              <Button
                className={styles.button}
                theme="blue"
                onClick={async ()=> {
                  await playQuery(q!).catch(showError);
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
