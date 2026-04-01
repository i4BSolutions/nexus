"use client";

import { useUserContext } from "@/contexts/UserContext";

/**
 * Hook to check if the authenticated user has a specific permission.
 * Reads from UserContext — no network request.
 * @param permissionKey - The permission key to check (e.g., "can_manage_purchase_orders")
 */
export function usePermission(permissionKey: string): boolean {
  const { permissions } = useUserContext();
  return !!permissions[permissionKey];
}
