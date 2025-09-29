import { usePathname, useSearchParams } from "next/navigation";

export function useCurrentUriPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    getCurrentPage: () => {
      return `${window.location.origin}${pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
    },
  };
}
