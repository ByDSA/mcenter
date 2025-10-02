"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "./Tabs";
import { MenuItemData } from "./Sidebar";

export function TabsClient(props: Parameters<typeof Tabs>[0]) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (itemPath: string) => {
    if (itemPath === "/")
      return pathname === "/";

    return pathname.startsWith(itemPath);
  };
  const { data, ...otherProps } = props;

  for (const d of data) {
    d.active = isActive(d.path);
    d.onClick = (e) => {
    // Si es click con cmd/ctrl (nueva pestaña) o click derecho, deja el comportamiento normal
      if (e.metaKey || e.ctrlKey || e.button !== 0)
        return;

      // Previene la navegación normal del <a>
      e.preventDefault();

      // Usa router.push para navegación client-side
      router.push(d.path);
    };
  }

  return (
    <Tabs data={data} {...otherProps} />
  );
}

export function makeSubMenu(data: MenuItemData[]) {
  return <TabsClient data={data} />;
}
