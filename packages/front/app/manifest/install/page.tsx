"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
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

// Variable global (se mantiene igual)
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  // MODIFICADO: TypeScript estricto requiere recibir 'Event' genérico y castear dentro
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

      logger.info(outcome);

      if (outcome === "accepted") {
        logger.info("App instalada con éxito");
        globalDeferredPrompt = null;
        setActivePrompt(null);
      }
    } catch (e: any) {
      logger.error(e.message);
    }
    handleBack();
    doing = false;
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
      setActivePrompt(event); // MODIFICADO: Actualizamos el estado
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    triggerRequireActive();

    if (globalDeferredPrompt)
      setActivePrompt(globalDeferredPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
    // No se pone "triggerRequireActive" en dependencias porque sólo importa la primera instancia
    // y así se sasegura que sólo se llame el useEfect una vez
  }, []);

  if (activePrompt)
    return null;

  return <div className={styles.content}><ContentSpinner /></div>;
}

export default function Page() {
  return <InstallPageContent />;
}
