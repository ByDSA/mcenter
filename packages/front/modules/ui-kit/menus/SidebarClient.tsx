"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "#modules/ui-kit/menus/Sidebar";

export function SidebarClient(props: Parameters<typeof Sidebar>[0]) {
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
    <Sidebar data={data} {...otherProps} />
  );
}
