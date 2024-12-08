import { createContext, useContext } from "react";

const ShopContext = createContext(null);

export function ShopProvider({ children, shop }) {
  return (
    <ShopContext.Provider value={shop}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
} 