import { ComponentProps } from "react";
import { SMALL_BREAKPOINT } from "#modules/player/browser/MediaPlayer/Bottom/breakpoints";
import { useWindowWidth } from "#modules/player/browser/MediaPlayer/Bottom/useWindowWidth";
import { PaginationContainer } from "#modules/ui-kit/Pagination/Pagination";

// eslint-disable-next-line import/no-default-export
export default function PaginationWithWidthClient(
  props: ComponentProps<typeof PaginationContainer>,
) {
  const width = useWindowWidth();

  return (
    <PaginationContainer
      {...props}
      position={width < SMALL_BREAKPOINT ? "both" : "top"}
    />
  );
}
