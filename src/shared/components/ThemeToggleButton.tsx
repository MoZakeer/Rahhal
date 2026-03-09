import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext'; // تأكد من مسار الملف
import { Moon, Sun } from 'lucide-react'; // بافتراض إنك بتستخدم مكتبة lucide

export default function ThemeToggleButton() {
  // بنجيب حالة الـ theme ودالة التغيير من الـ Context
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold w-full cursor-pointer transition-colors
        /* تنسيق الـ Light Mode (اللي كان معاك) */
        text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 
        /* تنسيق الـ Dark Mode */
        dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
    >
      {/* تغيير الأيقونة والنص بناءً على الوضع الحالي */}
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" /> Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" /> Dark Mode
        </>
      )}
    </button>
  );
}