import { useCallback, useEffect, useRef, useState } from "react";

export type BulkSelection = ReturnType<typeof useBulkSelection>;

export function useBulkSelection() {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  // Track whether the user has ever selected something during this bulk
  // session, so that toggling the bar on with 0 items does NOT exit.
  const hadSelectionRef = useRef(false);
  const activateBulkMode = useCallback(() => {
    hadSelectionRef.current = false;
    setIsBulkMode(true);
  }, []);
  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      next.has(id) ? next.delete(id) : next.add(id);

      return next;
    } );
  }, []);
  const clear = useCallback(() => {
    setSelectedIds(new Set());
    hadSelectionRef.current = false;
    setIsBulkMode(false);
  }, []);
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  // Auto-exit bulk mode when the last item is deselected, but only if
  // the user had selected something before (so opening with 0 items is fine).
  useEffect(() => {
    if (!isBulkMode) {
      hadSelectionRef.current = false;

      return;
    }

    if (selectedIds.size > 0)
      hadSelectionRef.current = true;
    else if (hadSelectionRef.current) {
      setIsBulkMode(false);
      hadSelectionRef.current = false;
    }
  }, [selectedIds.size, isBulkMode]);

  return {
    isBulkMode,
    activateBulkMode,
    selectedIds,
    toggle,
    clear,
    isSelected,
    count: selectedIds.size,
  };
}
