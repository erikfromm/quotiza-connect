import { createContext, useContext, useState } from "react";

const ConfigContext = createContext({
  importFrequency: "manual",
  setImportFrequency: () => {},
  shop: null,
  setShop: () => {}
});

export function ConfigProvider({ children, initialShop }) {
  const [importFrequency, setImportFrequency] = useState("manual");
  const [shop, setShop] = useState(initialShop);

  console.log("ConfigProvider:", { shop, importFrequency });

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