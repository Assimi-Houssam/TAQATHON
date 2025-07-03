"use client";

import { useMe } from "@/endpoints/auth/useMe";
import { User } from "@/types/entities";
import { createContext, ReactNode, useContext } from "react";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useMe();

  return (
    <UserContext.Provider
      value={{ user: user ?? null, isLoading, isError: isError || !user }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
