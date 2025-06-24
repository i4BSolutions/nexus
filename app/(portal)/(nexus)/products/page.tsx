"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderSection from "@/components/HeaderSection";
import { PlusOutlined, TagOutlined } from "@ant-design/icons";

export default function ProductsPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Products" }]}
      />

      <HeaderSection
        title="Products"
        description="Manage your product catalog"
        icon={<TagOutlined />}
        onAddNew={() => {}}
        buttonText="New Product"
        buttonIcon={<PlusOutlined />}
      />
    </section>
  );
}
