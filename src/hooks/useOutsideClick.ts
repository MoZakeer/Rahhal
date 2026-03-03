import { useEffect, useRef } from "react";

export function useOutsideClick<T extends HTMLElement>(
  handler: () => void,
  listCaputring: boolean = false,
) {
  const ref = useRef<T | null>(null);
  useEffect(
    function () {
      function handleClick(e: MouseEvent) {
        if (ref.current && !ref?.current?.contains(e.target as Node)) handler();
      }
      document.addEventListener("click", handleClick, listCaputring);
      return () =>
        document.removeEventListener("click", handleClick, listCaputring);
    },
    [handler, listCaputring],
  );
  return ref;
}
