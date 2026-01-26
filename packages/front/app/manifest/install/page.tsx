"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { logger } from "#modules/core/logger";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { useRequireActiveAction } from "#modules/utils/autoplay/useRequireActiveAction/useRequireActiveAction";
import styles from "./styles.module.css";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  } );
}

let doing = false;

function InstallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("returnPath");
  const [loaded, setLoaded] = useState(false);
  const [activePrompt, setActivePrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const handleBack = useCallback(() => {
    if (returnPath)
      router.back();
    else if (typeof window !== "undefined")
      window.close();
  }, [returnPath, router]);
  const handleInstall = useCallback(async () => {
    if (doing)
      return;

    doing = true;

    const promptToUse = activePrompt || globalDeferredPrompt;

    if (!promptToUse) {
      logger.error("Intento de instalación sin evento capturado");
      handleBack();

      return;
    }

    try {
      await promptToUse.prompt();

      const { outcome } = await promptToUse.userChoice;

      if (outcome === "accepted") {
        logger.info("App instalada con éxito");
        globalDeferredPrompt = null;
        setActivePrompt(null);
      }
    } catch (e: any) {
      logger.error(e.message);
    }
    handleBack();
  }, [activePrompt, handleBack]);
  const { action: triggerRequireActive } = useRequireActiveAction( {
    button: {
      content: "Instalar App",
      props: {
        className: styles.button,
      },
    },
    action: handleInstall,
  } );

  useEffect(() => {
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      if (globalDeferredPrompt)
        return;

      e.preventDefault();
      const event = e;

      globalDeferredPrompt = event;
      setActivePrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    triggerRequireActive();
    setLoaded(true);

    if (globalDeferredPrompt)
      setActivePrompt(globalDeferredPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
    // No se pone "triggerRequireActive" en dependencias porque sólo importa la primera instancia
    // y así se sasegura que sólo se llame el useEfect una vez
  }, []);

  const startUrl = useStartUrl();

  if (!loaded)
    return <div className={styles.content}><ContentSpinner /></div>;

  return <div className={styles.url}><p>La dirección de la App será:</p><p>{startUrl}</p></div>;
}

export default function Page() {
  return <InstallPageContent />;
}

function useStartUrl() {
  const [startUrl, setStartUrl] = useState<string>("");

  useEffect(() => {
    // Obtener la start_url del manifest
    const fetchManifest = async () => {
      try {
        const manifestLink = document.querySelector("link[rel=\"manifest\"]") as HTMLLinkElement;
        const manifestUrl = manifestLink?.href || "/manifest.json";
        const response = await fetch(manifestUrl);
        const manifest = await response.json();

        setStartUrl(manifest.start_url || "/");
      } catch (error) {
        logger.error("Error al cargar manifest:", error);
        setStartUrl("/");
      }
    };

    fetchManifest().catch(showError);
  }, []);

  return startUrl;
}
