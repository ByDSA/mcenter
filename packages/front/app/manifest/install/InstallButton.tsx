"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { isInstalledApp } from "#modules/utils/env";
import { logger } from "#modules/core/logger";

type Props = {
  name?: string;
  path?: string;
};

export function InstallButton(props?: Props) {
  const router = useRouter();
  const currentPath = usePathname();

  return <DaButton onClick={genOnClick( {
    ...props,
    router,
    currentPath,
  } )}>Instalar shortcut</DaButton>;
}

export function InstallContextMenuItem(props?: Props) {
  const router = useRouter();
  const currentPath = usePathname();

  return <ContextMenuItem
    label="Instalar shortcut"
    onClick={genOnClick( {
      ...props,
      router,
      currentPath,
    } )}/>;
}

type GenOnClickProps = Props & {
  currentPath: string;
  router: AppRouterInstance;
};
function genOnClick(props: GenOnClickProps) {
  return async (_: React.MouseEvent<HTMLElement>) => {
    const name = props?.name ?? window.prompt("¿Qué nombre quieres para tu App?");

    if (!name || name.trim() === "")
      return;

    const finalName = name.trim();
    const finalPath = props?.path ?? props.currentPath;
    const isInPwa = isInstalledApp();
    const params = new URLSearchParams();

    params.set("path", finalPath);

    if (!isInPwa)
      params.set("returnPath", props.currentPath);

    params.set("pwa_name", finalName);

    const installUrl = `/manifest/install?${params.toString()}`;

    if (!isInPwa)
      props.router.push(installUrl);
    else if (navigator.share) {
      try {
        await navigator.share( {
          title: "Instalar como App",
          text: "Abre en navegador para instalar",
          url: installUrl,
        } );
      } catch { /* empty */ }
    } else
      logger.error("No se pudo instalar");
  };
}
