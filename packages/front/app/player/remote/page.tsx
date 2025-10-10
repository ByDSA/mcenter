"use client";

/* eslint-disable require-await */
import { useCallback, useEffect, useRef, useState } from "react";
import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { useRouter } from "next/navigation";
import { getPreviousPath } from "app/NavigationWatcher";
import styles from "./styles.module.css";
import { sseRemotePlayers } from "./sse";
import { RemotePlayerEntry } from "./RemotePlayerEntry";
import { classes } from "#modules/utils/styles";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { useUser } from "#modules/core/auth/useUser";
import stylesFetching from "#modules/ui-kit/spinner/fetching.style.module.css";
import { PageSpinner } from "#modules/ui-kit/spinner/Spinner";

type Props = {
  onUnauthorized: ()=> Promise<void>;
};
const useRemotePlayers = (props?: Props) => {
  const [remotePlayers,
    setRemotePlayers] = useState<Record<string, RemotePlayerDtos.Front.Dto>>( {} );
  const [isLoading, setIsLoading] = useState(true);
  const setRemotePlayersRef = useRef(setRemotePlayers);

  setRemotePlayersRef.current = setRemotePlayers;
  const add = useCallback((conn: RemotePlayerDtos.Front.Dto) => {
    setRemotePlayersRef.current(old => ( {
      ...old,
      [conn.id]: conn,
    } ));
  }, []);
  const remove = useCallback((id: string) => {
    setRemotePlayersRef.current(old => {
      const newObj = {
        ...old,
        [id]: {
          ...old[id],
          status: "offline",
        } satisfies RemotePlayerDtos.Front.Dto,
      };

      return newObj;
    } );
  }, []);

  useEffect(()=> {
    return sseRemotePlayers( {
      url: backendUrl("/api/player/remote-players/stream"),
      onInitial: async (data)=> {
        setIsLoading(false);
        const obj: typeof remotePlayers = {};

        for (const r of data.remotePlayers)
          obj[r.id] = r;

        setRemotePlayersRef.current(obj);
      },
      onUnauthorized: async () => {
        await props?.onUnauthorized();
      },
      onNewConnection: async (data)=> {
        add(data.remotePlayer);
      },
      onDisconnection: async (data)=> {
        remove(data.remotePlayerId);
      },
      onErrorConnecting: async () => {
        setRemotePlayersRef.current( {} );
      },
      onOpenClosed: async (res) => {
        const { open, remotePlayerId } = res;

        setRemotePlayersRef.current(old => {
          const newObj = {
            ...old,
            [remotePlayerId]: {
              ...old[remotePlayerId],
              status: open ? "open" : "closed",
            } satisfies RemotePlayerDtos.Front.Dto,
          };

          return newObj;
        } );
      },
    } );
  }, []);

  return {
    remotePlayers: Object.values(remotePlayers).filter(Boolean),
    isLoading,
  };
};

export default function RemotePlayerSelector() {
  const router = useRouter();
  const { user } = useUser();
  const { remotePlayers, isLoading } = useRemotePlayers( {
    onUnauthorized: async ()=> {
      if (user) {
        logger.error("Unauthorized");
        router.push("/");
      } else
        router.push("/auth/login");
    },
  } );
  const initialCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading)
      return;

    const openRemotePlayers = remotePlayers.filter(r => r.status === "open");

    // Primera vez que tenemos datos: guardar el count inicial
    if (initialCountRef.current === null)
      initialCountRef.current = openRemotePlayers.length;

    if (openRemotePlayers.length !== 1)
      return;

    const redirect = ()=>router.push("/player/remote/" + openRemotePlayers[0].id);

    // Si inicialmente había 0 → siempre redirigir
    if (initialCountRef.current === 0) {
      redirect();

      return;
    }

    const previousPath = getPreviousPath();
    const cameFromRemotePlayer = previousPath === "/player/remote" || previousPath?.startsWith("/player/remote/");

    // Si inicialmente había 1 Y NO venimos de remote player → redirigir
    if (initialCountRef.current === 1 && !cameFromRemotePlayer) {
      redirect();

      return;
    }
  }, [remotePlayers]);

  return (
    <>
      <h1>Remote players</h1>

      {isLoading && <PageSpinner />}
      {!isLoading && remotePlayers.length === 0
        && <p className={classes(
          stylesFetching.loading,
          styles.error,
        )}>No se ha detectado ningún reproductor remoto.</p>}
      <section className={styles.list}>
        {remotePlayers.map(r=>(<RemotePlayerEntry key={r.id} value={r}/>))}
      </section>
    </>
  );
}
