import { useCallback, useRef } from "react";

const LONG_PRESS_DELAY_MS = 500;

/**
 * Returns a set of event props to spread on any element to detect a long press.
 * Works for both mouse (desktop) and touch (mobile).
 *
 * Usage:
 *   const lp = useLongPress(() => doSomething());
 *   return <div {...lp}>...</div>;
 */
// TODO: param como obj y poder pasar el delay en ms.
export function useLongPress(callback?: ()=> void) {
  if (!callback)
    return null;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const start = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      callback();
    }, LONG_PRESS_DELAY_MS);
  }, [callback]);
  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  // Prevent the normal click from firing after a long press so that
  // activating bulk-mode does not also navigate / play.
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (firedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      firedRef.current = false;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    // Capture phase so we can swallow the click before children see it
    onClickCapture: handleClick,
  };
}
