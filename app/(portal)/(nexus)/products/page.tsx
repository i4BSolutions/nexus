"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderSection from "@/components/HeaderSection";
import StatisticsCards from "@/components/StatisticsCards";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useState } from "react";

export default function ProductsPage() {
  const [counts, setCounts] = useState({
    total: 30,
    lowStock: 20,
    outOfStock: 10,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Products" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Products"
        description="Manage your product catalog"
        icon={<TagsOutlined />}
        onAddNew={() => {}}
        buttonText="New Product"
        buttonIcon={<PlusOutlined />}
      />

      {/* Statistics */}
      <StatisticsCards
        stats={[
          {
            title: "Total Products",
            value: counts.total,
            icon: <TagsOutlined />,
            bgColor: "#40A9FF",
            gradient: "linear-gradient(90deg, #e6f7ff 0%, #fff 100%)",
            borderColor: "#91D5FF",
          },
          {
            title: "Low Stock",
            value: counts.lowStock,
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FFA940",
            gradient: "linear-gradient(90deg, #fffbe6 0%, #fff 100%)",
            borderColor: "#FFD591",
          },
          {
            title: "Out of Stock",
            value: counts.outOfStock,
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FF4D4F",
            gradient: "linear-gradient(90deg, #fff1f0 0%, #fff 100%)",
            borderColor: "#FFA39E",
          },
        ]}
      />
    </section>
  );
}
