import { useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";
/**
 * Custom hook to update the document title.
 * @param title - The string to be appended to 'RAHHAL | '
 */
export const usePageTitle = (title: string): void => {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  useEffect(() => {

    const prevTitle: string = document.title;
    const brandName = isRtl ? "رَحَّال" : "Rahhal";

    document.title = `${title} | ${brandName}`;

    // Cleanup function
    return () => {
      document.title = prevTitle;
    };
  }, [title, isRtl]);
};