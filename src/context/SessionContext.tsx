"use client";

import React, { createContext, useContext } from "react";

type SessionContextType = {
  userName: string | null;
  userEmail: string | null;
};

const SessionContext = createContext<SessionContextType>({
  userName: null,
  userEmail: null,
});

export const SessionProvider: React.FC<{
  children: React.ReactNode;
  userName: string | null;
  userEmail: string | null;
}> = ({ children, userName, userEmail }) => {
  return (
    <SessionContext.Provider value={{ userName, userEmail }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
