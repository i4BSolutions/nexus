"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";

import { useRouter } from "next/navigation";

export default function PurchaseOrdersPage() {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto py-4 px-6">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Purchase Orders" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Purchase Orders"
        description="Manage and track all purchase orders"
        icon={<ShoppingCartOutlined />}
        onAddNew={() => {
          router.push("/purchase-orders/create");
        }}
        buttonText="New Purchase Order"
        buttonIcon={<PlusOutlined />}
      />
    </section>
  );
}
