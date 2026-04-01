"use client";

import MainLayout from "@/components/shared/MainLayout";
import { UserProvider } from "@/contexts/UserContext";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <MainLayout>{children}</MainLayout>
    </UserProvider>
  );
}
