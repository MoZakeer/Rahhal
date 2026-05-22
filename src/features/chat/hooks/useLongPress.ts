import { useCallback, useEffect, useRef } from "react";
import type React from "react";

interface LongPressOptions {
  delay?: number;
  moveThreshold?: number;
}

export function useLongPress(
  callback: () => void,
  options: LongPressOptions = {},
) {
  const { delay = 400, moveThreshold = 15 } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const isTouchRef = useRef(false);
  const startPosRef = useRef<{
    x: number;

    y: number;
  } | null>(null);

  // CLEAR
  const clearPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    triggeredRef.current = false;
    startPosRef.current = null;
  }, []);

  const startPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (!triggeredRef.current) {
        triggeredRef.current = true;
        callback();
        clearPress();
      }
    }, delay);
  }, [callback, delay, clearPress]);

  // TOUCH START
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isTouchRef.current = true;
      if (e.touches && e.touches.length > 0) {
        startPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
      startPress();
    },
    [startPress],
  );
  // TOUCH MOVE
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startPosRef.current || !e.touches || e.touches.length === 0) {
        return;
      }
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startPosRef.current.x);
      const diffY = Math.abs(currentY - startPosRef.current.y);
      if (diffX > moveThreshold || diffY > moveThreshold) {
        clearPress();
      }
    },
    [clearPress, moveThreshold],
  );

  const handleMouseDown = useCallback(() => {
    if (isTouchRef.current) return;

    startPress();
  }, [startPress]);

  // TOUCH END
  const handleTouchEnd = useCallback(() => {
    clearPress();

    setTimeout(() => {
      isTouchRef.current = false;
    }, 50);
  }, [clearPress]);

  // CLEANUP
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: clearPress,
    onMouseLeave: clearPress,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}
