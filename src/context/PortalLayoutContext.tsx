'use client';

import React, { createContext, useContext } from 'react';

interface PortalLayoutContextValue {
  openMobileSidebar: () => void;
}

const PortalLayoutContext = createContext<PortalLayoutContextValue | null>(null);

export const PortalLayoutProvider: React.FC<{
  openMobileSidebar: () => void;
  children: React.ReactNode;
}> = ({ openMobileSidebar, children }) => {
  return (
    <PortalLayoutContext.Provider value={{ openMobileSidebar }}>
      {children}
    </PortalLayoutContext.Provider>
  );
};

export const usePortalLayout = () => useContext(PortalLayoutContext);
