import React from "react";

import { Space } from "antd";

import Breadcrumbs from "@/components/Breadcrumbs";

interface SupplierPageProps {
  params: { id: string };
}

const SupplierPage: React.FC<SupplierPageProps> = ({ params }) => {
  return (
    <Space direction="vertical" className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Suppliers", href: "/suppliers" },
          { title: `Supplier ${params.id}`, href: `/suppliers/${params.id}` },
        ]}
      />
      <h1>Supplier Details</h1>
      <p>Supplier ID: {params.id}</p>
    </Space>
  );
};

export default SupplierPage;
