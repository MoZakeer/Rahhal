import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useScrollRestoration(key: string) {
   const location = useLocation();
   const isRestored = useRef(false);

   useEffect(() => {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`);

      if (savedPosition && !isRestored.current) {
         const checkAndScroll = setInterval(() => {
            const targetScroll = parseInt(savedPosition, 10);

            if (document.documentElement.scrollHeight > targetScroll) {
               window.scrollTo({ top: targetScroll, behavior: "instant" });
               isRestored.current = true;
               clearInterval(checkAndScroll);
            }
         }, 50);

         setTimeout(() => clearInterval(checkAndScroll), 1000);
      }

      let scrollTimeout: ReturnType<typeof setTimeout>;
      const handleScroll = () => {
         clearTimeout(scrollTimeout);
         scrollTimeout = setTimeout(() => {
            if (window.scrollY > 0) {
               sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
            }
         }, 100);
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
         window.removeEventListener("scroll", handleScroll);
         clearTimeout(scrollTimeout);
      };
   }, [key, location.key]);
}