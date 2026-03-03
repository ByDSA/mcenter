"use client";

/* eslint-disable require-await */
import { useCallback, useEffect, useRef, useState } from "react";
import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { getPreviousPath } from "app/NavigationWatcher";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { useUser } from "#modules/core/auth/useUser";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import { EmptyList } from "#modules/resources/EmptyList/EmptyList";
import { PageContent } from "#modules/ui-kit/layouts/PageContainer/PageContent";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { phraseCase } from "#modules/core/i18n/utils";
import { RemotePlayerEntry } from "./RemotePlayerEntry";
import { sseRemotePlayers } from "./sse";
import styles from "./styles.module.css";

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
  const { LL } = useI18nContext();

  useEffect(()=> {
    return sseRemotePlayers( {
      url: backendUrl(PATH_ROUTES.player.remotePlayers.stream.path),
      LL,
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
  const { LL } = useI18nContext();
  const { remotePlayers, isLoading } = useRemotePlayers( {
    onUnauthorized: async ()=> {
      if (user) {
        logger.error(LL.core.errors.unauthorized.unauthorized());
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
    <PageContainer>
      <PageContent>
        <h1>{phraseCase(LL.modules.player.remote.title())}</h1>

        <section className={styles.list}>
          {isLoading && <ContentSpinner />}
          {!isLoading && remotePlayers.length === 0
        && <EmptyList label={LL.modules.player.remote.noPlayers()} />}
          {remotePlayers.map(r=>(<RemotePlayerEntry key={r.id} value={r}/>))}
        </section>
      </PageContent>
    </PageContainer>
  );
}
