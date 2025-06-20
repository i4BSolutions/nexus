"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";

export default function AntDProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AntdRegistry>{children}</AntdRegistry>;
}
