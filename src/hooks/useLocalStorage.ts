import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialState: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const [value, setValue] = useState<T>(function () {
    try {
      const storedValue = localStorage.getItem(key);
      if (!storedValue) return initialState;
      
      // بنحاول نعمل parse، لو نجح يبقى ده JSON سليم
      return JSON.parse(storedValue);
    } catch (error) {
      // لو ضرب Error (زي حالة التوكن)، نرجع النص العادي زي ما هو
      // أو نرجع القيمة المبدئية عشان الصفحة متقعش
      const rawValue = localStorage.getItem(key);
      return (rawValue as unknown as T) || initialState;
    }
  });

  useEffect(
    function () {
      try {
        // لو هي String عادي، مش محتاجين نعملها Stringify تاني
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value],
  );

  return [value, setValue];
}