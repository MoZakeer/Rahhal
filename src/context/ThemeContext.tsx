import React, { createContext, useState, useEffect } from 'react';

// إنشاء الـ Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // التحقق من الـ LocalStorage أو تفضيلات النظام
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // لو مفيش حاجة محفوظة، بنشوف الـ System Preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

useEffect(() => {
    // إضافة أو إزالة الكلاسات من الـ HTML root
    if (theme === 'dark') {
      // ضفنا dark و dark-mode عشان نرضي Tailwind وشغلك القديم
      document.documentElement.classList.add('dark', 'dark-mode'); 
    } else {
      document.documentElement.classList.remove('dark', 'dark-mode');
    }
    // حفظ الاختيار
    localStorage.setItem('theme', theme);
  }, [theme]);

  // دالة للتبديل بين الوضعين
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};