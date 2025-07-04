"use client";

import BudgetStatsCard from "@/components/budgets/BudgetStatsCard";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { apiGet } from "@/lib/react-query/apiClient";
import { BudgetStatistics } from "@/types/budgets/budgets.type";
import { mapBudgetStatsToItems } from "@/utils/mapStatistics";
import { DollarCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Empty, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function BudgetsPage() {
  const router = useRouter();

  const { data: statsData, isLoading: loadingStatistics } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => apiGet("api/budgets/statistics"),
  });

  const stats = statsData
    ? mapBudgetStatsToItems(statsData as BudgetStatistics)
    : [];

  const handleAddNewBudget = useCallback(() => {
    router.push("/budgets/create");
  }, []);

  if (loadingStatistics)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spin />
      </div>
    );

  if (stats.length === 0 || !stats)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Empty />
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Budgets" }]}
      />

      <HeaderSection
        title="Budgets"
        description="Create and manage budgets for projects and operations"
        icon={<DollarCircleOutlined />}
        onAddNew={handleAddNewBudget}
        buttonText="New Budget"
        buttonIcon={<PlusOutlined />}
      />

      <BudgetStatsCard stats={stats} />
    </section>
  );
}
