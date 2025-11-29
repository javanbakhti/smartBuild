import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '@/lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    const currentDirection = language === 'ar' || language === 'fa' ? 'rtl' : 'ltr';
    setDirection(currentDirection);
    document.documentElement.dir = currentDirection;
    document.documentElement.lang = language;
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key, replacements = {}) => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacements[placeholder]);
    });
    return translation;
  };
  
  const changeLanguage = (langCode) => {
    setLanguage(langCode);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);