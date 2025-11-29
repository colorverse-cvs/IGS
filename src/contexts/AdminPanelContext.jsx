import React, { createContext, useContext, useState } from "react";

const AdminPanelContext = createContext();

export function AdminPanelProvider({ children }) {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <AdminPanelContext.Provider value={{ isAdminPanelOpen, setIsAdminPanelOpen }}>
      {children}
    </AdminPanelContext.Provider>
  );
}

export function useAdminPanel() {
  const context = useContext(AdminPanelContext);
  if (!context) {
    throw new Error("useAdminPanel must be used within AdminPanelProvider");
  }
  return context;
}

