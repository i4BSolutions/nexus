"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import StatisticsCards from "@/components/shared/StatisticsCards";
import { useBudgetAllocations } from "@/hooks/budget-allocations/useBudgetAllocation";
import { usePermission } from "@/hooks/shared/usePermission";

import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import { StatItem } from "@/types/shared/stat-item.type";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Pagination,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import Input, { SearchProps } from "antd/es/input";
import { ColumnsType, SortOrder } from "antd/es/table/interface";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const { RangePicker } = DatePicker;

export default function BudgetAllocationsPage() {
  const hasPermission = usePermission("can_manage_budgets_allocations");
  const router = useRouter();
  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>();
  const [sortField, setSortField] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const sortParam =
    sortField && sortOrder
      ? `${sortField}_${sortOrder === "ascend" ? "asc" : "desc"}`
      : undefined;

  const { data: budgetAllocationData, isLoading: budgetAllocationIsLoading } =
    useBudgetAllocations({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sort: sortParam,
      status,
      q: searchText,
      startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
      endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
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
          total_approved: budgetAllocationData.statistics.totalAllocations,
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
          total_approved: budgetAllocationData.statistics.totalAllocatedUSD,
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
          total_approved: budgetAllocationData.statistics.totalPendingUSD,
        },
      ];
      setStatItems(stats);
    }
  }, [budgetAllocationData]);

  if (!statItems) return null;

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
    setDateRange(null);
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
      key: "allocation_number",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "PO NUMBER",
      dataIndex: "purchase_order_no",
      key: "purchase_order_no",
      render: (purchase_order_no, record) => (
        <Link href={`/purchase-orders/${record.po_id}`}>
          {purchase_order_no}
        </Link>
      ),
    },
    {
      title: "DATE",
      dataIndex: "allocation_date",
      key: "allocation_date",
      render: (date: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "allocation_amount",
      key: "allocation_amount",
      sorter: (a, b) => a.equivalent_usd - b.equivalent_usd,
      defaultSortOrder: "descend",
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
      key: "exchange_rate_usd",
      render: (_, record) =>
        `1 USD = ${record.exchange_rate_usd} ${record.currency_code}`,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Approved"
              ? "green"
              : status === "Pending"
              ? "orange"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "ACTIONS",
      render: (_, record) => (
        <Flex justify="start" align="center" gap={4}>
          <Button
            onClick={() => router.push(`/budget-allocations/${record.id}`)}
            style={{ padding: 0 }}
            type="link"
          >
            View
          </Button>
          <Divider type="vertical" />
          <Button
            onClick={() => router.push(`/budget-allocations/${record.id}/edit`)}
            style={{ padding: 0 }}
            type="link"
          >
            Edit
          </Button>
        </Flex>
      ),
    },
  ];

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
        hasPermission={hasPermission}
        buttonIcon={<PlusOutlined />}
      />

      {statItems.length > 0 && <StatisticsCards stats={statItems} />}

      <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
        <Input.Search
          placeholder="Search By Allocated Number"
          allowClear
          onSearch={onSearchHandler}
          style={{ maxWidth: 420 }}
        />
        <Flex justify="center" align="center" gap={12}>
          <span>Filter(s):</span>
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            allowClear
            style={{ minWidth: 260 }}
            value={dateRange}
          />
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
