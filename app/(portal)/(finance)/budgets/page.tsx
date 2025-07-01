"use client";

import BudgetStatsCard, {
  StatItem,
} from "@/components/budgets/BudgetStatsCard";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const stats: StatItem[] = [
  {
    title: "Total Planned",
    value: 1000000,
    tooltip: "Total planned amount across all budgeted campaigns",
    icon: <DollarOutlined />,
    bgColor: "#13c2c2",
    borderColor: "#b5f5ec",
    gradient: "linear-gradient(135deg, #e6fffb, #ffffff)",
    isCurrency: true,
    bottomText: "Across 4 active budget projects",
  },
  {
    title: "Total Allocated",
    value: 400,
    tooltip: "Total allocated amount",
    icon: <CheckCircleOutlined />,
    bgColor: "#40a9ff",
    borderColor: "#bae7ff",
    gradient: "linear-gradient(135deg, #e6f7ff, #ffffff)",
    isCurrency: true,
    showProgress: true,
    progressPercent: 60,
  },
  {
    title: "Total Invoiced",
    value: 400000,
    tooltip: "Actual amount invoiced or spent across all campaigns",
    icon: <ArrowUpOutlined />,
    bgColor: "#9254de",
    borderColor: "#d3adf7",
    gradient: "linear-gradient(135deg, #f9f0ff, #ffffff)",
    isCurrency: true,
    showProgress: true,
    progressPercent: 66.66,
  },
  {
    title: "Avg. Utilization",
    value: "62.5%",
    tooltip: "Average utilization of the allocated budget",
    icon: <DollarCircleOutlined />,
    bgColor: "#fadb14",
    borderColor: "#fff566",
    gradient: "linear-gradient(135deg, #fffbe6, #ffffff)",
    bottomText: "Across 4 active budget projects",
  },
];

export default function BudgetsPage() {
  const handleAddNewProduct = () => {
    console.log("Add new product");
  };
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Budgets" }]}
      />

      <HeaderSection
        title="Budgets"
        description="Create and manage budgets for projects and operations"
        icon={<DollarCircleOutlined />}
        onAddNew={handleAddNewProduct}
        buttonText="New Budget"
        buttonIcon={<PlusOutlined />}
      />

      <BudgetStatsCard stats={stats} />
    </section>
  );
}
