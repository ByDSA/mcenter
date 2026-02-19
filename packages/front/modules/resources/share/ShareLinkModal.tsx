"use client";

import { useState, useEffect, ReactNode } from "react";
import { showError } from "$shared/utils/errors/showError";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { logger } from "#modules/core/logger";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaInputBooleanCheckbox } from "#modules/ui-kit/form/input/Boolean/InputBoolean";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { copyText } from "../../musics/lists/playlists/utils";
import styles from "./ShareLinkModal.module.css";

export type ShareLinkOptions = {
  autoplay: boolean;
  includeToken: boolean;
};

type Props = {
  topNode?: ReactNode;
  buildUrl: (opts: ShareLinkOptions)=> Promise<string> | string;
  showAutoplay?: boolean;
  showIncludeToken?: boolean;
  onCopy: ()=> void;
};

export function ShareModalContent( { buildUrl,
  showAutoplay,
  showIncludeToken,
  topNode,
  onCopy }: Props) {
  const [autoplay, setAutoplay] = useState(true);
  const [includeToken, setIncludeToken] = useState(false);
  const [url, setUrl] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      const result = await buildUrl( {
        autoplay,
        includeToken,
      } );

      if (!cancelled)
        setUrl(result);
    }

    generate().catch(showError);

    return () => {
      cancelled = true;
    };
  }, [autoplay, includeToken, buildUrl]);

  const handleCopy = async () => {
    await copyText(url);
    logger.info("Enlace copiado.");
    onCopy();
  };
  const handleShare = async () => {
    try {
      await navigator.share( {
        url,
      } );
      onCopy();
    } catch (e) {
      // El usuario canceló el share nativo: no hacemos nada
      if (e instanceof Error && e.name !== "AbortError")
        logger.error("Error al compartir:", e.message);
    }
  };

  return (
    <div className={styles.container}>
      {topNode}
      <div className={styles.urlPreview}>
        {url}
      </div>

      <DaInputGroup inline>
        {(showAutoplay || showIncludeToken) && (
          <>
            {showAutoplay && (
              <DaInputBooleanCheckbox
                value={autoplay}
                onChange={(e) => setAutoplay(e)}
                label="Autoplay"
              />
            )}
            {showIncludeToken
             && <DaInputBooleanCheckbox
               value={includeToken}
               onChange={(e) => setIncludeToken(e)}
               label="Incluir token"
             />}
          </>
        )}
      </DaInputGroup>

      <DaFooterButtons>
        {canShare && (
          <DaButton theme="blue" onClick={handleShare}>
            Compartir
          </DaButton>
        )}
        <DaButton theme="blue" onClick={handleCopy}>
          Copiar
        </DaButton>
      </DaFooterButtons>
    </div>
  );
}
