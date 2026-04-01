"use client";

import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextValue {
  user: User | null;
  permissions: Record<string, boolean>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  permissions: {},
  isLoading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const authenticatedUser = await getAuthenticatedUser(supabase);
      setUser(authenticatedUser);
      setPermissions(authenticatedUser?.user_metadata?.permissions || {});
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Subscribe to Realtime changes on user_profiles for the current user
  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`user-permissions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profiles",
          filter: `id=eq.${user.id}`,
        },
        () => {
          refreshUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshUser]);

  return (
    <UserContext.Provider value={{ user, permissions, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
