import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { registerSW } from "./pwa/registerSW.js";

registerSW();

// Initialize dark mode from localStorage
if (localStorage.getItem("lifeline.theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
  document.documentElement.setAttribute("data-theme", "dark");
}

// Initialize language direction
const savedLang = localStorage.getItem("lifeline.lang") || "fr";
document.documentElement.lang = savedLang;
if (savedLang === "ar") document.documentElement.dir = "rtl";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
