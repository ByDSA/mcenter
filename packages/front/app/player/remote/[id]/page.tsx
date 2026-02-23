"use client";

import React, { ReactNode, use, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { isDefined } from "$shared/utils/validation";
import { useRouter } from "next/navigation";
import { EpisodeEntity } from "#modules/episodes/models";
import { PlayerStatusResponse } from "#modules/player/remote-player/models";
import { Episode } from "#modules/episodes/models";
import { RemotePlayerWebSocketsClient } from "#modules/player/remote-player";
import { EpisodesApi } from "#modules/episodes/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { logger } from "#modules/core/logger";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { EpisodesCrudDtos } from "#modules/episodes/models/dto";
import { RemotePlayerProvider } from "#modules/player/remote-player/RemotePlayerContext";
import { RemoteLayout } from "#modules/player/remote-player/Layout";
import { PageContainer } from "app/PageContainer";
import { Breadcrumbs } from "#modules/ui-kit/Breadcrumbs/Breadcrumbs";

// ---------------------------------------------------------------------------
// Estado de caché de recursos por URI (fuera del componente para persistir
// entre renders, igual que en la versión original)
// ---------------------------------------------------------------------------
let webSockets: RemotePlayerWebSocketsClient | undefined;
const RESOURCES = ["series"];
const uriToResource: { [key: string]: Episode | null } = {};
let fetchingResource = false;

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RemotePlayer( { params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const routerRef = useRef(router);

  routerRef.current = router;

  // eslint-disable-next-line no-empty-function
  const gotoRemotePlayers = useRef(() => {} );

  gotoRemotePlayers.current = () => {
    router.push("/player/remote");
  };

  const [resource, setResource] = useState<EpisodeEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = React.useState<PlayerStatusResponse | undefined>(undefined);
  const setResourceRef = useRef(setResource);
  const previousUriRef = useRef("");
  const intentionalDisconnectOrErrorRef = useRef(false);

  setResourceRef.current = setResource;

  useEffect(() => {
    const socketInitializer = () => {
      webSockets = new (class A extends RemotePlayerWebSocketsClient {
        onBackendConnect(): void {
          logger.debug("connected to backend");
          setIsLoading(false);
        }

        onConnectError(): void {
          gotoRemotePlayers.current();
        }

        onDisonnect(): void {
          if (!intentionalDisconnectOrErrorRef.current)
            gotoRemotePlayers.current();
        }

        onStatus(newStatus: PlayerStatusResponse) {
          setStatus(newStatus);

          const uri = newStatus.status?.playlist?.current?.uri;

          if (!uri || uri === previousUriRef.current)
            return;

          if (!fetchingResource) {
            const path = getPathFromUri(uri);

            if (!path)
              return;

            const body: EpisodesCrudDtos.GetMany.Criteria = {
              filter: {
                path,
              },
              expand: ["series", "fileInfos", "imageCover"],
            };

            fetchingResource = true;
            const episodesApi = FetchApi.get(EpisodesApi);

            episodesApi
              .getManyByCriteria(body)
              .then((res: EpisodesCrudDtos.GetMany.Response) => {
                const episodes = res.data;
                const [episode] = episodes;

                try {
                  uriToResource[uri] = episode ?? null;
                  setResourceRef.current(episode ?? null);
                } catch {
                  uriToResource[uri] = null;
                }

                fetchingResource = false;
              } )
              .catch(showError)
              .finally(() => {
                previousUriRef.current = uri;
              } );
          }
        }
      } )();

      webSockets.init( {
        remotePlayerId: id,
      } );

      return () => {
        intentionalDisconnectOrErrorRef.current = true;
        webSockets?.close();
      };
    };

    return socketInitializer();
  }, []);

  useEffect(() => {
    if (status && !status.open)
      gotoRemotePlayers.current();
  }, [status]);

  let content: ReactNode | null = null;

  if (isLoading || !isDefined(status?.status))
    content = <ContentSpinner />;

  if (webSockets) {
    content = <RemotePlayerProvider
      value={{
        statusResponse: status,
        resource,
        player: webSockets,
      }}
    >
      <RemoteLayout />
    </RemotePlayerProvider>;
  }

  return (
    <PageContainer>
      <Breadcrumbs
        items={[{
          label: "Remote players",
          href: "/player/remote",
        },
        {
          label: "Player",
        },
        ]} />
      {content}
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPathFromUri(uri: string): string | null {
  try {
    const url = new URL(uri);
    const { pathname } = url;
    const pathNameSplitted = pathname.split("/");
    let indexResourceType = -1;

    for (let i = 0; i < pathNameSplitted.length; i++) {
      if (RESOURCES.includes(pathNameSplitted[i])) {
        indexResourceType = i;
        break;
      }
    }

    if (indexResourceType !== -1)
      return pathNameSplitted.slice(indexResourceType + 1).join("/");
  } catch {
    // URL inválida
  }

  return null;
}
