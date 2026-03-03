"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { isInstalledApp } from "#modules/utils/env";
import { logger } from "#modules/core/logger";
import { useI18nContext } from "#modules/core/i18n/i18n-react";

type Props = {
  name?: string;
  path?: string;
};

export function InstallButton(props?: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const { LL } = useI18nContext();

  return <DaButton onClick={genOnClick( {
    ...props,
    router,
    currentPath,
    LL,
  } )}>{LL.main.pwa.button()}</DaButton>;
}

export function InstallContextMenuItem(props?: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const { LL } = useI18nContext();

  return <ContextMenuItem
    label={LL.main.pwa.button()}
    onClick={genOnClick( {
      ...props,
      router,
      currentPath,
      LL,
    } )}/>;
}

type GenOnClickProps = Props & {
  currentPath: string;
  router: AppRouterInstance;
  LL: ReturnType<typeof useI18nContext>["LL"];
};
function genOnClick(props: GenOnClickProps) {
  const { LL } = props;

  return async (_: React.MouseEvent<HTMLElement>) => {
    const name = props?.name ?? window.prompt(props.LL.main.pwa.appNamePrompt());

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
          title: LL.main.pwa.title(),
          text: LL.main.pwa.text(),
          url: installUrl,
        } );
      } catch { /* empty */ }
    } else
      logger.error(LL.main.pwa.installingError());
  };
}
