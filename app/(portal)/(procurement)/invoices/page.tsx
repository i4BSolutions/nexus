"use client";

// React and Next.js Imports
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Ant Design Components
import {
  CarryOutOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Flex,
  Progress,
  Segmented,
  Select,
  Spin,
  Typography,
} from "antd";
import Input, { SearchProps } from "antd/es/input";

// Types
import { StatItem } from "@/types/shared/stat-item.type";

// Components
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import StatisticsCards from "@/components/shared/StatisticsCards";

// Hooks
import CardView from "@/components/purchase-invoices/CardView";
import TableView from "@/components/purchase-invoices/TableView";
import { useList } from "@/hooks/react-query/useList";
import {
  PurchaseInvoiceDto,
  PurchaseInvoiceResponse,
} from "@/types/purchase-invoice/purchase-invoice.type";

export default function InvoicesPage() {
  const [statItems, setStatItems] = useState<StatItem[]>();
  const [viewMode, setViewMode] = useState<"Card" | "Table">("Card");

  const [pagination, setPagination] = useState({ page: 1, pageSize: 9 });
  const [dateSort, setDateSort] = useState<
    "date_asc" | "date_desc" | undefined
  >();
  const [amountSort, setAmountSort] = useState<
    "amount_asc" | "amount_desc" | undefined
  >();

  const [total, setTotal] = useState<number>(0);

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const [data, setData] = useState<PurchaseInvoiceDto[]>();

  const router = useRouter();

  function getSortLabel() {
    if (dateSort === "date_asc") return "Invoice Date (Newest First)";
    if (dateSort === "date_desc") return "Invoice Date (Oldest First)";
    if (amountSort === "amount_asc") return "Amount (Highest First)";
    if (amountSort === "amount_desc") return "Amount (Lowest First)";
    return "Invoice Date (Newest First)"; // default fallback
  }

  const {
    data: piData,
    isPending,
    refetch,
  } = useList<PurchaseInvoiceResponse>("purchase-invoices", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: status,
    q: searchText,
    dateSort,
    amountSort,
  });

  useEffect(() => {
    if (piData) {
      const data = piData.items.map((item) => ({
        id: item.id,
        purchase_invoice_number: item.purchase_invoice_number,
        purchase_order_no: item.purchase_order_no,
        invoice_date: item.invoice_date,
        due_date: item.due_date,
        currency_code: item.currency_code,
        usd_exchange_rate: item.usd_exchange_rate,
        total_amount_local: item.total_amount_local,
        total_amount_usd: item.total_amount_usd,
        status: item.status,
        note: item.note,
        delivered_percentage: item.delivered_percentage,
        pending_delivery_percentage: item.pending_delivery_percentage,
      }));
      setData(data);
      setTotal(piData.total);
      setStatItems([
        {
          title: "Total Invoices",
          value: piData.statistics.total_invoices,
          icon: <FileTextOutlined />,
          bgColor: "#FFC53D",
          gradient: "linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)",
          borderColor: "#FFC53D",
          tooltip: "Total number of invoices",
          total_approved: piData.statistics.total_invoices,
        },
        {
          title: "Total USD Value",
          value: piData.statistics.total_usd,
          icon: <DollarOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Total USD value of all invoices",
          total_approved: piData.statistics.total_invoices,
          prefix: "$",
          approved_text: "invoices",
          footerContent: (
            <Typography.Text type="secondary">
              Across {piData.statistics.total_invoices || 0}{" "}
            </Typography.Text>
          ),
        },
        {
          title: "% Delivered",
          value: piData.statistics.delivered,
          suffix: "%",
          icon: <CarryOutOutlined />,
          bgColor: "#9254DE",
          gradient: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
          borderColor: "#D3ADF7",
          tooltip: "Delivered invoices rate",
          footerContent: (
            <Progress
              percent={piData.statistics.delivered}
              showInfo={false}
              strokeColor="#9254DE"
            />
          ),
        },
      ]);
    }
  }, [piData]);

  if (isPending) {
    return (
      <Flex justify="center" align="center" style={{ height: "100vh" }}>
        <Spin />
      </Flex>
    );
  }

  if (!data) return null;
  if (!statItems) return null;

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const onSortHandler = (value: string) => {
    switch (value) {
      case "Invoice Date (Newest First)":
        setDateSort("date_asc");
        setAmountSort(undefined);
        break;
      case "Invoice Date (Oldest First)":
        setDateSort("date_desc");
        setAmountSort(undefined);
        break;
      case "Amount (Highest First)":
        setAmountSort("amount_asc");
        setDateSort(undefined);
        break;
      case "Amount (Lowest First)":
        setAmountSort("amount_desc");
        setDateSort(undefined);
        break;
      default:
        setDateSort(undefined);
        setAmountSort(undefined);
    }

    refetch();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statusChangeHandler = (value: string) => {
    setStatus(value === "All Status" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const viewChangeHandler = (value: "Card" | "Table") => {
    if (value == "Table") {
      setPagination((prev) => ({ ...prev, pageSize: 10 }));
    } else {
      setPagination((prev) => ({ ...prev, pageSize: 9 }));
    }

    setViewMode(value);
  };

  const clearFiltersHandler = () => {
    setStatus(undefined);
    setSearchText("");
    setDateSort(undefined);
    setAmountSort(undefined);
    setPagination({ page: 1, pageSize: 10 });
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Invoices" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Invoices"
        description="Manage and track all purchase invoices"
        bgColor="#FFC53D"
        icon={<FileTextOutlined style={{ fontSize: 20, color: "white" }} />}
        onAddNew={() => router.push("/invoices/create")}
        buttonText="New Invoice"
        buttonIcon={<PlusOutlined />}
      />

      {/* Statistics Cards */}
      <StatisticsCards stats={statItems} />

      {/* Search and Filters */}
      <Flex justify="center" align="center" gap={12}>
        <Input.Search
          placeholder="Search By PO Number"
          allowClear
          onSearch={onSearchHandler}
        />
        {viewMode === "Card" ? (
          <>
            <Flex justify="center" align="center" gap={12}>
              <span>Sort:</span>
              <Select
                value={getSortLabel()}
                style={{ width: 160 }}
                onChange={onSortHandler}
                options={[
                  {
                    value: "Invoice Date (Newest First)",
                    label: "Invoice Date (Newest First)",
                  },
                  {
                    value: "Invoice Date (Oldest First)",
                    label: "Invoice Date (Oldest First)",
                  },
                  {
                    value: "Amount (Highest First)",
                    label: "Amount (Highest First)",
                  },
                  {
                    value: "Amount (Lowest First)",
                    label: "Amount (Lowest First)",
                  },
                ]}
              />
            </Flex>

            <div className="bg-[#D9D9D9] w-[1px] h-7" />
          </>
        ) : (
          <div className="bg-transparent w-[425px] h-7" />
        )}

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
                value: "Scheduled",
                label: "Scheduled",
              },
              {
                value: "Paid",
                label: "Paid",
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

        <div className="bg-[#D9D9D9] w-[1px] h-7" />

        <Segmented<"Card" | "Table">
          options={["Card", "Table"]}
          style={{ borderRadius: 9, border: "1px solid #D9D9D9" }}
          onChange={viewChangeHandler}
        />
      </Flex>

      {viewMode === "Card" ? (
        <CardView
          data={data}
          pagination={pagination}
          paginationChangeHandler={paginationChangeHandler}
          total={total}
        />
      ) : (
        <TableView
          data={data}
          pagination={pagination}
          paginationChangeHandler={paginationChangeHandler}
          total={total}
        />
      )}
    </section>
  );
}
