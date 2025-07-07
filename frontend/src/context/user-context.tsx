"use client";

// import { useMe } from "@/endpoints/auth/useMe";
import { User } from "@/types/entities";
import { EntityTypes } from "@/types/entities/enums/index.enum";
import { createContext, ReactNode, useContext } from "react";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // const { data: user, isLoading, isError } = useMe();
  
  // Mock admin user for development - bypasses auth system
  const user: User = {
    id: 1,
    first_name: "Admin",
    last_name: "User", 
    username: "admin",
    entity_type: EntityTypes.OCP_AGENT, // OCP_AGENT to access anomalies dashboard
    phone_number: "+212123456789",
    language: "en",
    status: "active",
    email: "admin@ocp.ma",
    roles: ["admin"],
    is_active: true,
    is_verified: true
  };
  
  const isLoading = false;
  const isError = false;

  return (
    <UserContext.Provider
      value={{ user, isLoading, isError }}
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
