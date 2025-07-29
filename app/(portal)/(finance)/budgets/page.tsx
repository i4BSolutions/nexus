"use client";

import BudgetCard from "@/components/budgets/BudgetCard";
import BudgetStatsCard, {
  StatItem,
} from "@/components/budgets/BudgetStatsCard";
import TableView from "@/components/budgets/TableView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { useList } from "@/hooks/react-query/useList";
import { apiGet } from "@/lib/react-query/apiClient";
import {
  Budget,
  BudgetResponse,
  BudgetStatistics,
} from "@/types/budgets/budgets.type";
import { mapBudgetStatsToItems } from "@/utils/mapStatistics";
import { DollarCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Empty, Flex, Spin, Input, Select, Button, Segmented } from "antd";
import { SearchProps } from "antd/es/input";
import { SortOrder } from "antd/es/table/interface";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSoftDeleteBudget } from "@/hooks/budget-statistics/useSoftDeleteBudget";

export default function BudgetsPage() {
  const router = useRouter();
  const [openPopConfirm, setOpenPopConfirm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"Card" | "Table">("Card");
  const [statusFilter, setStatusFilter] = useState<string | undefined>("");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
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

  const { data: statsData, isLoading: loadingStatistics } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => apiGet("api/budgets/statistics"),
  });

  const stats = statsData
    ? mapBudgetStatsToItems(statsData as BudgetStatistics)
    : [];

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

  if (loadingStatistics || loadingBudgets)
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

      {stats.length === 0 || !stats ? (
        <Empty />
      ) : (
        <BudgetStatsCard stats={stats} />
      )}

      {budgets.items.length === 0 || !budgets ? (
        <Empty />
      ) : (
        <>
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
                value={statusFilter ?? "All Status"}
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
              onChange={viewChangeHandler}
            />
          </Flex>
          {viewMode === "Card" ? (
            <BudgetCard
              data={budgets}
              onStatusChange={handleSoftDeleteBudget}
            />
          ) : (
            <TableView data={budgets.items} />
          )}
        </>
      )}
    </section>
  );
}
