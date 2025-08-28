"use client";

import BudgetCard from "@/components/budgets/BudgetCard";
import BudgetStatsCard, {
  StatItem,
} from "@/components/budgets/BudgetStatsCard";
import TableView from "@/components/budgets/TableView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { useSoftDeleteBudget } from "@/hooks/budget-statistics/useSoftDeleteBudget";
import { useList } from "@/hooks/react-query/useList";
import { usePermission } from "@/hooks/shared/usePermission";
import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
import {
  DollarCircleOutlined,
  DownCircleOutlined,
  PlusOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { Button, Empty, Flex, Input, Segmented, Select, Spin } from "antd";
import { SearchProps } from "antd/es/input";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function BudgetsPage() {
  const hasPermission = usePermission("can_manage_budgets_allocations");

  const router = useRouter();

  const [viewMode, setViewMode] = useState<"Card" | "Table">("Card");
  const [statusFilter, setStatusFilter] = useState<string | undefined>("");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>("descend");

  const sortParam =
    sortField && sortOrder
      ? `${sortField}_${sortOrder === "ascend" ? "asc" : "desc"}`
      : "";

  const { data: budgetsData, isLoading: loadingBudgets } = useList("budgets", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    q: searchText,
    status: statusFilter,
    sort: sortParam,
  });
  const budgets = budgetsData as BudgetResponse;

  useEffect(() => {
    if (budgets) {
      setStatItems([
        {
          title: "Total Planned",
          value: formatWithThousandSeparator(budgets.statistics.totalPlanned),
          icon: <DollarCircleOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFFFFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Sum of all planned budgets across all active projects",
          bottomText: `Across ${budgets.statistics.active} active budget projects`,
        },
        {
          title: "Total Allocated",
          value: formatWithThousandSeparator(budgets.statistics.totalAllocated),
          icon: <DownCircleOutlined />,
          bgColor: "#40A9FF",
          gradient: "linear-gradient(90deg, #E6F7FF 0%, #FFFFFF 100%)",
          borderColor: "#91D5FF",
          tooltip: "Total budget already allocated to project teams",
          showProgress: true,
          progressPercent: budgets.statistics.allocatedVsPlannedPercentage,
        },
        {
          title: "Total Invoiced",
          value: formatWithThousandSeparator(budgets.statistics.totalInvoiced),
          icon: <UpCircleOutlined />,
          bgColor: "#9254DE",
          gradient: "linear-gradient(90deg, #F9F0FF 0%, #FFFFFF 100%)",
          borderColor: "#D3ADF7",
          tooltip: "Actual amount invoiced or spent across all campaigns",
          showProgress: true,
          progressPercent: budgets.statistics.invoicedVsAllocatedPercentage,
        },
        {
          title: "Avg. Utilization",
          value: new Intl.NumberFormat("en-US", {
            style: "percent",
            maximumFractionDigits: 2,
          }).format(budgets.statistics.averageUtilization),
          icon: <DollarCircleOutlined />,
          bgColor: "#FFC53D",
          gradient: "linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)",
          borderColor: "#FFE58F",
          tooltip: "Total number of budgets",
          showProgress: true,
          progressPercent: budgets.statistics.averageUtilization,
        },
      ]);
    }
  }, [budgets]);

  const softDeleteBudget = useSoftDeleteBudget();

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
    setPagination({ page: 1, pageSize: 10 });
  };

  const onSortHandler = (value: string) => {
    const lastUnderscoreIndex = value.lastIndexOf("_");
    const field = value.substring(0, lastUnderscoreIndex);
    const direction = value.substring(lastUnderscoreIndex + 1);
    setSortField(field);
    setSortOrder(direction === "asc" ? "ascend" : "descend");
    setPagination({ page: 1, pageSize: 10 });
  };

  const statusChangeHandler = (value: string) => {
    setStatusFilter(value === "All Status" ? undefined : value);
    setPagination({ page: 1, pageSize: 10 });
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setSortField(undefined);
    setSortOrder("descend");
    setPagination({ page: 1, pageSize: 10 });
  };

  const viewChangeHandler = (value: "Card" | "Table") => {
    setViewMode(value);
    console.log(`View changed to ${value}`);
  };

  const handleSoftDeleteBudget = useCallback((budget: Budget) => {
    softDeleteBudget.mutateAsync(budget.id);
  }, []);

  const handleAddNewBudget = useCallback(() => {
    router.push("/budgets/create");
  }, [router]);

  if (loadingBudgets)
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

  return (
    <section className="max-w-7xl mx-auto">
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
        hasPermission={hasPermission}
      />

      <BudgetStatsCard stats={statItems} />

      <Flex
        justify="center"
        align="center"
        gap={12}
        style={{ marginTop: 12, marginBottom: 12 }}
      >
        <Input.Search
          placeholder="Search By Project or Budget Name"
          allowClear
          onSearch={onSearchHandler}
        />
        <Flex justify="center" align="center" gap={12}>
          <span>Sort:</span>
          <Select
            defaultValue="Project Name (Z-A)"
            style={{ width: 160 }}
            onChange={onSortHandler}
            options={[
              { value: "project_name_asc", label: "Project Name (A-Z)" },
              { value: "project_name_desc", label: "Project Name (Z-A)" },
              { value: "budget_name_asc", label: "Budget Name (A-Z)" },
              { value: "budget_name_desc", label: "Budget Name (Z-A)" },
            ]}
          />
        </Flex>
        <div className="bg-[#D9D9D9] w-[1px] h-7" />
        <Flex justify="center" align="center" gap={12}>
          <span>Filter(s):</span>
          <Select
            defaultValue="All Status"
            style={{ width: 160 }}
            onChange={statusChangeHandler}
            options={[
              {
                value: "All Status",
                label: "All Status",
              },
              {
                value: "true",
                label: "Active",
              },
              {
                value: "false",
                label: "Inactive",
              },
            ]}
          />
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={handleClearFilters}
          >
            Clear Filter(s)
          </Button>
        </Flex>
        <div className="bg-[#D9D9D9] w-[1px] h-7" />
        <Segmented<"Card" | "Table">
          options={["Card", "Table"]}
          style={{ borderRadius: 9, border: "1px solid #D9D9D9" }}
          value={viewMode}
          onChange={viewChangeHandler}
        />
      </Flex>

      {budgets.items.length === 0 || !budgets ? (
        <Empty />
      ) : (
        <>
          {viewMode === "Card" ? (
            <BudgetCard
              data={budgets}
              hasPermission={hasPermission}
              onStatusChange={handleSoftDeleteBudget}
            />
          ) : (
            <TableView data={budgets.items} hasPermission={hasPermission} />
          )}
        </>
      )}
    </section>
  );
}
