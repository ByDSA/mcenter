"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "#modules/ui-kit/Breadcrumbs/Breadcrumbs";

export function PageContentBreadcrumbs() {
  const pathname = usePathname();

  return <Breadcrumbs pathname={pathname} />;
}
