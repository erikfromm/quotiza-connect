import { createContext, useContext, useState, useEffect } from "react";

const ConfigContext = createContext({
  importFrequency: "manual",
  setImportFrequency: () => {},
  shop: null,
  setShop: () => {}
});

export function ConfigProvider({ children, initialShop, initialImportFrequency }) {
  const [importFrequency, setImportFrequency] = useState(initialImportFrequency);
  const [shop, setShop] = useState(initialShop);

  const value = {
    importFrequency,
    setImportFrequency,
    shop,
    setShop
  };

  return (
    <ConfigContext.Provider value={value}>
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