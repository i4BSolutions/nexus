"use client";

import React from "react";
import { Breadcrumb } from "antd";
import { useRouter } from "next/navigation";

export type CrumbItem = {
  title: React.ReactNode;
  href?: string;
};

type Props = {
  items: CrumbItem[];
};

const Breadcrumbs: React.FC<Props> = ({ items }) => {
  const router = useRouter();

  return (
    <Breadcrumb
      items={items.map((item) => ({
        title: item.href ? (
          <span
            onClick={() => router.push(item.href!)}
            style={{ cursor: "pointer" }}
          >
            {item.title}
          </span>
        ) : (
          item.title
        ),
      }))}
      style={{ marginBottom: 16 }}
    />
  );
};

export default Breadcrumbs;
