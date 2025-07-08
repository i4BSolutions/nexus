"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { DollarCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function BudgetAllocationsPage() {
  const router = useRouter();

  const handleAddNewBudgetAllocations = useCallback(() => {
    router.push("/budget-allocations/create");
  }, [router]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Budget Allocations" }]}
      />

      <HeaderSection
        title="Budget Allocations"
        description="Manage your budget allocations"
        icon={<DollarCircleOutlined />}
        onAddNew={handleAddNewBudgetAllocations}
        buttonText="Add New Budget Allocation"
        buttonIcon={<PlusOutlined />}
      />
    </section>
  );
}
