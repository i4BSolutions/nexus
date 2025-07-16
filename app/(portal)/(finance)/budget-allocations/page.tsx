"use client";

import StatusBadge from "@/components/purchase-orders/StatusBadge";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import StatisticsCards from "@/components/shared/StatisticsCards";
import { useList } from "@/hooks/react-query/useList";
import {
  BudgetAllocationsInterface,
  BudgetAllocationsResponse,
} from "@/types/budget-allocations/budget-allocations.type";
import { StatItem } from "@/types/shared/stat-item.type";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Empty,
  Flex,
  Pagination,
  Select,
  Table,
  Typography,
} from "antd";
import Input, { SearchProps } from "antd/es/input";
import { ColumnsType, SortOrder } from "antd/es/table/interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function BudgetAllocationsPage() {
  const router = useRouter();
  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>();
  const [searchText, setSearchText] = useState("");

  const { data: budgetAllocationData, isLoading: budgetAllocationIsLoading } =
    useList<BudgetAllocationsResponse>("budget-allocations", {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sort: sortOrder
        ? `order_date_${sortOrder === "ascend" ? "asc" : "desc"}`
        : undefined,
      status: status,
      q: searchText,
    });

  useEffect(() => {
    if (budgetAllocationData?.statistics) {
      const stats: StatItem[] = [
        {
          title: "Total Allocations",
          value: budgetAllocationData.statistics.totalAllocations,
          icon: <DollarCircleOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFFFFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Total number of allocations created",
        },
        {
          title: "Total Allocated (USD)",
          value: budgetAllocationData.statistics.totalAllocatedUSD,
          icon: <DollarOutlined />,
          prefix: "$",
          bgColor: "#B7EB8F",
          gradient: "linear-gradient(90deg, #F6FFED 0%, #FFFFFF 100%)",
          borderColor: "#B7EB8F",
          tooltip: "Total equivalent USD value of all allocations",
        },
        {
          title: "Pending Allocated (USD)",
          value: budgetAllocationData.statistics.totalPendingUSD,
          icon: <DollarCircleOutlined />,
          prefix: "$",
          bgColor: "#FFC53D",
          gradient: "linear-gradient(90deg, #FFFBE6 0%, #FFFFFF 100%)",
          borderColor: "#FFE58F",
          tooltip: "Total pending allocations' equivalent USD",
        },
      ];
      setStatItems(stats);
    }
  }, [budgetAllocationData]);

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
  };

  const statusChangeHandler = (value: string) => {
    setStatus(value === "All Status" ? undefined : value);
  };

  const clearFiltersHandler = () => {
    setStatus(undefined);
    setSearchText("");
    setSortOrder(undefined);
    setPagination({ page: 1, pageSize: 10 });
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  const handleAddNewBudgetAllocations = useCallback(() => {
    router.push("/budget-allocations/create");
  }, [router]);

  const columns: ColumnsType<BudgetAllocationsInterface> = [
    {
      title: "ALLOCATION NUMBER",
      dataIndex: "allocation_number",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "PO NUMBER",
      dataIndex: "po_id",
      render: (po_id, record) => (
        <a>PO-2025-{String(po_id).padStart(4, "0")}</a>
      ),
    },
    {
      title: "DATE",
      dataIndex: "allocation_date",
      render: (date: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "AMOUNT",
      sorter: true,
      sortOrder: sortOrder?.includes("allocation_amount")
        ? sortOrder.includes("asc")
          ? "ascend"
          : "descend"
        : undefined,
      render: (_, record) => {
        const usd = record.allocation_amount / record.exchange_rate_usd;
        return (
          <div>
            {record.allocation_amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {record.currency_code}
            <br />
            <Typography.Text type="secondary">
              (${usd.toFixed(2)})
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: "EXCHANGE RATE",
      render: (_, record) =>
        `1 USD = ${record.exchange_rate_usd} ${record.currency_code}`,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "ACTIONS",
      render: (_, record) => (
        <Flex justify="start" align="center" gap={4}>
          <Button style={{ padding: 0 }} type="link">
            View
          </Button>
          <Divider type="vertical" />
          <Button style={{ padding: 0 }} type="link">
            Edit
          </Button>
        </Flex>
      ),
    },
  ];

  if (!budgetAllocationData || !budgetAllocationData.items)
    return (
      <Empty
        description="You can create a new budget allocation by clicking the button."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

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

      {statItems.length > 0 ? (
        <StatisticsCards stats={statItems} />
      ) : (
        <Empty
          description="You can create a new budget allocation by clicking the button."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
        <Input.Search
          placeholder="Search By Allocated Number"
          allowClear
          onSearch={onSearchHandler}
          style={{ maxWidth: 420 }}
        />
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
                value: "Pending",
                label: "Pending",
              },
              {
                value: "Approved",
                label: "Approved",
              },
            ]}
          />
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={clearFiltersHandler}
          >
            Clear Filter(s)
          </Button>
        </Flex>
      </Flex>
      <Table
        dataSource={budgetAllocationData?.items || []}
        columns={columns}
        rowKey="id"
        showSorterTooltip={{ target: "sorter-icon" }}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        pagination={false}
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {budgetAllocationData?.items.length} items
            </Typography.Text>
            <Pagination
              defaultCurrent={1}
              current={pagination.page}
              total={budgetAllocationData?.total}
              onChange={paginationChangeHandler}
            />
          </div>
        )}
        loading={budgetAllocationIsLoading}
      />
    </section>
  );
}
