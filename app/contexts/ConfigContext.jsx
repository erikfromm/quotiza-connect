import { createContext, useContext, useState } from "react";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [importFrequency, setImportFrequency] = useState("manual");

  return (
    <ConfigContext.Provider value={{ importFrequency, setImportFrequency }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
} 