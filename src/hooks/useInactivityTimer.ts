import { useEffect, useRef, useCallback } from "react";

export interface UseInactivityTimerOptions {
  resetOn?: string[];
  target?: Window | HTMLElement;
}

/**
 * Hook that triggers a callback after a period of inactivity
 * @param delay - Delay in milliseconds, or null to disable
 * @param callback - Function to call after inactivity period
 * @param options - Configuration options
 */
export function useInactivityTimer(
  delay: number | null,
  callback: () => void,
  options: UseInactivityTimerOptions = {}
) {
  const { resetOn = ["mousemove", "focusin", "scroll", "keydown"], target = window } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (delay !== null && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);
    }
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (delay === null) {
      clear();
      return;
    }

    // Start timer on mount
    reset();

    // Set up event listeners
    const events = resetOn;
    const handleEvent = () => {
      reset();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clear();
      } else {
        reset();
      }
    };

    events.forEach((event) => {
      target.addEventListener(event, handleEvent, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        target.removeEventListener(event, handleEvent);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clear();
    };
  }, [delay, resetOn, target, reset, clear]);

  return { reset, clear };
}

export type UseInactivityTimerReturn = ReturnType<typeof useInactivityTimer>;

