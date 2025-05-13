import { createContext, useContext } from "react";

type Theme = "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void; // Keep for API compatibility, but it won't do anything
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Always light theme
  const theme: Theme = "light";
  
  // This function exists only for API compatibility
  const toggleTheme = () => {
    // Does nothing since we only have light theme
    console.log("Dark mode has been removed from the application");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
