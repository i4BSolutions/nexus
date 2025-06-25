"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Space } from "antd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SupplierPage = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <Space direction="vertical" className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Suppliers", href: "/suppliers" },
          { title: `Supplier ${id}`, href: `/suppliers/${id}` },
        ]}
      />
      <h1>Supplier Details</h1>
      <p>Supplier ID: {id}</p>
    </Space>
  );
};

export default SupplierPage;
