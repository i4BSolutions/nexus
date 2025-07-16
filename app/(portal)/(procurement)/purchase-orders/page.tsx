"use client";

import { useState } from "react";
import { PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import CreateOptionsModal from "@/components/purchase-orders/CreateOptionsModal";

export default function PurchaseOrdersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

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
          setShowCreateModal(true);
        }}
        buttonText="New Purchase Order"
        buttonIcon={<PlusOutlined />}
      />

      {/* Create Options Modal */}
      <CreateOptionsModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </section>
  );
}
