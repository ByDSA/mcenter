"use client";

import { usePathname, useRouter } from "next/navigation";
import { MouseEventHandler, ReactNode } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Tabs } from "./Tabs";
import { MenuItemData } from "./Sidebar";

type Props = Parameters<typeof Tabs>[0] & {
  before?: ReactNode;
};
export function TabsClient(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const matchPath = (itemPath: string) => {
    if (itemPath === "/")
      return pathname === "/";

    return pathname.startsWith(itemPath);
  };
  const { data, ...otherProps } = props;

  for (const d of data) {
    d.active = matchPath(d.matchPath?.startsWith ?? d.path);
    d.onClick = anchorOnClick( {
      router,
      href: d.path,
    } );
  }

  return (
    <Tabs data={data} {...otherProps} />
  );
}

export function makeSubMenu(data: MenuItemData[]) {
  return <TabsClient data={data} />;
}

export function anchorOnClick( { router, href }: {href: string;
router: AppRouterInstance;} ): MouseEventHandler<HTMLAnchorElement> {
  return (e) => {
    // Si es click con cmd/ctrl (nueva pestaña) o click derecho, deja el comportamiento normal
    if (e.metaKey || e.ctrlKey || e.button !== 0)
      return;

    // Previene la navegación normal del <a>
    e.preventDefault();

    // Usa router.push para navegación client-side
    router.push(href);
  };
}
