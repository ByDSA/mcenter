"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function ManifestManager() {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const pwaName = searchParams.get("pwa_name");
  const pathname = searchParams.get("path") ?? currentPath;
  const manifestUrl = `/manifest/dynamic?path=${encodeURIComponent(pathname)}${pwaName ? `&name=${encodeURIComponent(pwaName)}` : ""}`;

  return (
    <link rel="manifest" href={manifestUrl} />
  );
}
