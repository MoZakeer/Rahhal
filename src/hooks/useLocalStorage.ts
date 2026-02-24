import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialState: T) {
  const [value, setValue] = useState<T>(function () {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key, value],
  );
  return [value, setValue];
}
