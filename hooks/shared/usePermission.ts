"use client";

import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

/**
 * Hook to check if the authenticated user has a specific permission.
 * @param permissionKey - The permission key to check (e.g., "can_manage_purchase_orders")
 * @returns {boolean | null} - Returns true/false when loaded, null while loading
 */
export function usePermission(permissionKey: string): boolean {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const user = await getAuthenticatedUser(createClient());
        const permissions = user?.user_metadata?.permissions || {};
        setHasPermission(!!permissions[permissionKey]);
      } catch (err) {
        console.error("Failed to fetch user permissions:", err);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [permissionKey]);

  return hasPermission;
}
