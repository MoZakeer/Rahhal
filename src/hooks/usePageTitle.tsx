import { useEffect } from 'react';

/**
 * Custom hook to update the document title.
 * @param title - The string to be appended to 'RAHHAL | '
 */
export const usePageTitle = (title: string): void => {
  useEffect(() => {

   const prevTitle: string = document.title;
    
    document.title = `${title} | Rahhal`;

    // Cleanup function
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};