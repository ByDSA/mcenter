"use client";

import { usePathname, useRouter } from "next/navigation";
import { MenuItemData } from "./Sidebar";
import { TopbarItem } from "./TopbarItem";

type Props = {
  data: MenuItemData[];
};
export function TopbarMainClient( { data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (itemPath: string) => {
    if (itemPath === "/")
      return pathname === "/";

    return pathname.startsWith(itemPath);
  };

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

  return data.map((item) => TopbarItem(item));
}
