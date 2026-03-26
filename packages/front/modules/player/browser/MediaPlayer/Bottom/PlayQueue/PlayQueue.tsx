import { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PlayerStatus, PlaylistQueueItem as QItem, useBrowserPlayer } from "../../BrowserPlayerContext";
import { QueueItem } from "./PlayQueueItem";

type Props = {
  className?: string;
  onClickPlay?: (item: QItem, prevStatus: PlayerStatus)=> void;
};

/** Metadata attached to each row in the combined virtual list */
type CombinedEntry = {
  item: QItem;

  /** True for items that are pending in priorityQueue (not yet played) */
  isPriorityPending: boolean;

  /** True for the item currently playing */
  isCurrent: boolean;

  /** Index in queue[] — defined for regular queue items */
  queueOriginalIndex?: number;

  /** Index in priorityQueue[] — defined for pending priority items */
  priorityOriginalIndex?: number;
};

export const PlayQueue = ( { className, onClickPlay }: Props) => {
  const queue = useBrowserPlayer(s => s.queue);
  const queueIndex = useBrowserPlayer(s => s.queueIndex);
  const priorityQueue = useBrowserPlayer(s => s.priorityQueue);
  const currentResource = useBrowserPlayer(s => s.currentResource);
  const playQueueIndex = useBrowserPlayer(s => s.playQueueIndex);
  const playPriorityIndex = useBrowserPlayer(s => s.playPriorityIndex);
  const combinedItems = useMemo<CombinedEntry[]>(() => {
    const isPlayingPriority = !!currentResource?.fromPriority;
    const result: CombinedEntry[] = [];

    if (!isPlayingPriority) {
      // History: queue[0..queueIndex-1]
      for (let i = 0; i < queueIndex && i < queue.length; i++) {
        result.push( {
          item: queue[i],
          isPriorityPending: false,
          isCurrent: false,
          queueOriginalIndex: i,
        } );
      }

      // Current: queue[queueIndex]
      if (queueIndex >= 0 && queueIndex < queue.length) {
        result.push( {
          item: queue[queueIndex],
          isPriorityPending: false,
          isCurrent: true,
          queueOriginalIndex: queueIndex,
        } );
      }
    } else {
      // History: queue[0..queueIndex] inclusive (queueIndex was the last queue item)
      for (let i = 0; i <= queueIndex && i < queue.length; i++) {
        result.push( {
          item: queue[i],
          isPriorityPending: false,
          isCurrent: false,
          queueOriginalIndex: i,
        } );
      }

      // Current: the priority item being played right now
      if (currentResource) {
        result.push( {
          item: currentResource,
          isPriorityPending: false,
          isCurrent: true,
        } );
      }
    }

    // Priority pending items (shown with differentiated background)
    priorityQueue.forEach((item, i) => {
      result.push( {
        item,
        isPriorityPending: true,
        isCurrent: false,
        priorityOriginalIndex: i,
      } );
    } );

    // Upcoming: queue[queueIndex+1..]
    for (let i = queueIndex + 1; i < queue.length; i++) {
      result.push( {
        item: queue[i],
        isPriorityPending: false,
        isCurrent: false,
        queueOriginalIndex: i,
      } );
    }

    return result;
  }, [queue, queueIndex, priorityQueue, currentResource]);
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer( {
    count: combinedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  } );
  const items = virtualizer.getVirtualItems();

  // Scroll to current item when queueIndex or priority state changes
  useEffect(() => {
    const currentIndex = combinedItems.findIndex(e => e.isCurrent);

    if (currentIndex === -1 || !parentRef.current)
      return;

    const vItem = items.find((item) => item.index === currentIndex);
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
      virtualizer.scrollToIndex(currentIndex, {
        align: "start",
      } );
    }
  }, [queueIndex, currentResource, virtualizer, combinedItems]);

  const content = useMemo(() => {
    return <div
      style={ {
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      } }
    >
      {items.map((vItem) => {
        const { index } = vItem;
        const entry = combinedItems[index];

        if (!entry)
          return null;

        const handleClickPlay = async (prevStatus: PlayerStatus) => {
          if (entry.priorityOriginalIndex !== undefined)
            await playPriorityIndex(entry.priorityOriginalIndex!);
          else if (entry.queueOriginalIndex !== undefined)
            await playQueueIndex(entry.queueOriginalIndex!);

          onClickPlay?.(entry.item, prevStatus);
        };

        return (
          <QueueItem
            key={vItem.key}
            item={entry.item}
            start={vItem.start}
            size={vItem.size}
            isCurrent={entry.isCurrent}
            isPriorityPending={entry.isPriorityPending}
            onClickPlay={handleClickPlay}
          />
        );
      } )}
    </div>;
  }, [items, combinedItems, onClickPlay, playQueueIndex, playPriorityIndex]);

  return <div
    ref={parentRef}
    className={className}
  >
    {content}
  </div>;
};
