import { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PlayerResource, PlayerStatus, useBrowserPlayer } from "../../BrowserPlayerContext";
import { QueueItem } from "./PlayQueueItem";

type Props = {
  className?: string;
  onClickPlay?: (item: PlayerResource, prevStatus: PlayerStatus)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlayQueue = ( { className, onClickPlay }: Props) => {
  const status = useBrowserPlayer(s=>s.status);
  const queue = useBrowserPlayer(s=>s.queue);
  const queueIndex = useBrowserPlayer(s=>s.queueIndex);
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer( {
    count: queue.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  } );
  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    const index = queueIndex;

    if (index === undefined || index === null || !parentRef.current)
      return;

    const vItem = items.find((item) => item.index === index);
    const viewportTop = virtualizer.scrollOffset ?? 0;
    const viewportBottom = viewportTop + parentRef.current.clientHeight;
    let isVisible = false;

    if (vItem) {
      const itemTop = vItem.start;
      const itemBottom = vItem.start + vItem.size;

      // Se considera visible si tanto el inicio como el fin están dentro del rango
      isVisible = itemTop >= viewportTop && itemBottom <= viewportBottom;
    }

    if (!isVisible) {
      virtualizer.scrollToIndex(index, {
        align: "start",
      } );
    }
  }, [queueIndex, virtualizer]);

  const content = useMemo(()=> {
    return <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {items.map((vItem) => {
        const { index } = vItem;
        const item = queue[index];

        if (!item)
          return null;

        return (
          <QueueItem
            key={vItem.key}
            index={index}
            item={item}
            playerStatus={status}
            start={vItem.start}
            size={vItem.size}
            onClickPlay={onClickPlay ? (prevStatus) => onClickPlay(item, prevStatus) : undefined}
          />
        );
      } )}
    </div>;
  }, [items, status, queue]);

  return <div
    ref={parentRef}
    className={className}
  >
    {content}
  </div>;
};
