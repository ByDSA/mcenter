"use client";

import { createContext, ReactNode, useState } from "react";
import { UserPayload } from "./models";

interface UserContextType {
  user: UserPayload | null;
  setUser: (user: UserPayload | null)=> void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser: UserPayload | null;
}

export function UserProvider( { children, initialUser }: UserProviderProps) {
  const [user, setUser] = useState(initialUser);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}
