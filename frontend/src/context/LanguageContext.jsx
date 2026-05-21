import { createContext, useContext, useMemo, useState } from "react";
import { translations, LANGUAGES } from "../i18n/translations.js";

const LanguageContext = createContext(null);

function getInitialLang() {
  if (typeof window === "undefined") return "fr";
  return localStorage.getItem("lifeline.lang") || "fr";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  function changeLang(code) {
    setLang(code);
    localStorage.setItem("lifeline.lang", code);
    // Set direction for Arabic
    const langInfo = LANGUAGES.find((l) => l.code === code);
    document.documentElement.dir = langInfo?.dir || "ltr";
    document.documentElement.lang = code;
  }

  const t = useMemo(() => translations[lang] || translations.fr, [lang]);

  const value = useMemo(() => ({ lang, t, changeLang, LANGUAGES }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
