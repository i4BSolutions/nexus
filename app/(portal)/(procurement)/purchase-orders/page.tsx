"use client";

import CreateOptionsModal from "@/components/purchase-orders/CreateOptionsModal";

import PoCardView from "@/components/purchase-orders/PoCardView";
import PoTableView from "@/components/purchase-orders/PoTableView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import {
  DollarOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";

import StatisticsCards from "@/components/shared/StatisticsCards";
import { useList } from "@/hooks/react-query/useList";
import { usePermission } from "@/hooks/shared/usePermission";
import {
  PurchaseOrderDto,
  PurchaseOrderResponse,
} from "@/types/purchase-order/purchase-order.type";
import { StatItem } from "@/types/shared/stat-item.type";
import { Badge, Button, Flex, Segmented, Select, Spin, Typography } from "antd";
import Input, { SearchProps } from "antd/es/input";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PurchaseOrderExportCSVModal, {
  FlattenedPurchaseOrderDto,
} from "@/components/purchase-orders/PurchaseOrderExportCSVModal";
import { exportPOToCsv } from "@/utils/exportPOCSV";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// function flattenForExport(
//   data: PurchaseOrderDto[]
// ): FlattenedPurchaseOrderDto[] {
//   return data.flatMap((po) => {
//     if (!po.invoices?.length) {
//       return [
//         {
//           ...po,
//           inv_number: "",
//           inv_currency: "",
//           inv_amount: 0,
//           inv_quantity: 0,
//           inv_sku: "",
//           inv_name: "",
//           inv_price: 0,
//           stock_type: "",
//           stock_qty: 0,
//         },
//       ];
//     }

//     return po.invoices.flatMap((inv) =>
//       (inv.items ?? []).map((item) => ({
//         ...po,
//         inv_number: inv.purchase_invoice_number ?? "",
//         inv_currency: inv.purchase_invoice_currency ?? "",
//         inv_amount: (item.unit_price_local || 0) * (item.quantity || 0),
//         inv_quantity: item.quantity ?? 0,
//         inv_sku: item.sku ?? "",
//         inv_name: item.name ?? "",
//         inv_price: item.unit_price_local ?? 0,
//         stock_type: item.stock_type ?? "",
//         stock_qty: item.stock_qty ?? 0,
//       }))
//     );
//   });
// }

function flattenForExport(
  data: PurchaseOrderDto[]
): FlattenedPurchaseOrderDto[] {
  return data.flatMap((po) => {
    if (!po.invoices?.length) {
      return [
        {
          ...po,
          inv_number: "",
          inv_currency: "",
          inv_amount: 0,
          inv_exchange_rate_to_usd: 0,
          inv_quantity: 0,
          inv_sku: "",
          inv_name: "",
          inv_price: 0,
          stock_type: "",
          stock_qty: 0,
        },
      ];
    }

    return po.invoices.flatMap((inv) =>
      (inv.items ?? []).flatMap((item) => {
        if (item.stock_transactions?.length) {
          return item.stock_transactions.map((st) => ({
            ...po,
            inv_number: inv.purchase_invoice_number ?? "",
            inv_currency: inv.purchase_invoice_currency ?? "",
            inv_amount: (item.unit_price_local || 0) * (item.quantity || 0),
            inv_exchange_rate_to_usd:
              inv.purchase_invoice_exchange_rate_to_usd || 0,
            inv_quantity: item.quantity ?? 0,
            inv_sku: item.sku ?? "",
            inv_name: item.name ?? "",
            inv_price: item.unit_price_local ?? 0,
            stock_type: st.type ?? "",
            stock_qty: st.quantity ?? 0,
            stock_sku: item.sku ?? "",
          }));
        }

        return [
          {
            ...po,
            inv_number: inv.purchase_invoice_number ?? "",
            inv_currency: inv.purchase_invoice_currency ?? "",
            inv_amount: (item.unit_price_local || 0) * (item.quantity || 0),
            inv_exchange_rate_to_usd:
              inv.purchase_invoice_exchange_rate_to_usd || 0,
            inv_quantity: item.quantity ?? 0,
            inv_sku: item.sku ?? "",
            inv_name: item.name ?? "",
            inv_price: item.unit_price_local ?? 0,
            stock_type: "",
            stock_qty: 0,
            stock_sku: item.sku ?? "",
          },
        ];
      })
    );
  });
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [statItems, setStatItems] = useState<StatItem[]>();
  const [viewMode, setViewMode] = useState<"Card" | "Table">("Card");
  const [data, setData] = useState<PurchaseOrderDto[]>();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 9 });
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>();
  const [total, setTotal] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);
  const hasPermission = usePermission("can_manage_purchase_orders");

  const { data: poData, isPending } = useList<PurchaseOrderResponse>(
    "purchase-orders",
    {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sort: sortOrder
        ? `order_date_${sortOrder === "ascend" ? "asc" : "desc"}`
        : undefined,
      status: status !== "All Status" ? status : undefined,
      q: searchText,
    }
  );

  useEffect(() => {
    if (poData) {
      const data = poData.dto.map((item) => ({
        id: item.id,
        purchase_order_no: item.purchase_order_no,
        order_date: item.order_date,
        status: item.status,
        amount_local: item.amount_local,
        amount_usd: item.amount_usd,
        currency_code: item.currency_code,
        usd_exchange_rate: item.usd_exchange_rate,
        contact_person: item.contact_person,
        expected_delivery_date: item.expected_delivery_date,
        invoiced_amount: item.invoiced_amount || 0,
        remaining_invoiced_amount: item.remaining_invoiced_amount || 0,
        invoiced_percentage: item.invoiced_percentage || 0,
        allocated_amount: item.allocated_amount || 0,
        remaining_allocation: item.remaining_allocation || 0,
        allocation_percentage: item.allocation_percentage || 0.0,
        purchase_order_smart_status: item.purchase_order_smart_status,
        region: item.region,
        supplier: item.supplier,
        invoices: item.invoices || [],
      }));
      setData(data);
      setTotal(poData.total);
      setStatItems([
        {
          title: "Total POs",
          value: poData.statistics.total,
          icon: <ShoppingCartOutlined />,
          bgColor: "#40A9FF",
          gradient: "linear-gradient(90deg, #E6F7FF 0%, #FFF 100%)",
          borderColor: "#91d5ff",
          tooltip: "Total number of purchase orders",
          total_approved: poData.statistics.total_approved,
          footerContent: (
            <div className="flex justify-between items-center gap-6">
              <Badge
                status="success"
                color="#52c41a"
                text={`${poData.statistics.total_approved || 0} Approved`}
              />
              <Badge
                status="warning"
                color="#faad14"
                text={`${poData.statistics.total_draft || 0} Draft`}
              />
            </div>
          ),
        },
        {
          title: "Total USD Value",
          value: poData.statistics.total_usd_value,
          icon: <DollarOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Total value of all purchase orders",
          prefix: "$",
          approved_text: "approved POs",
          footerContent: (
            <Typography.Text type="secondary">
              Across {poData.statistics.total_approved || 0} approved POs
            </Typography.Text>
          ),
        },
        {
          title: "% Invoiced",
          value: poData.statistics.invoiced_percentage,
          icon: <DollarOutlined />,
          bgColor: "#597EF7",
          gradient: "linear-gradient(90deg, #F0F5FF 0%, #FFF 100%)",
          borderColor: "#ADC6FF",
          tooltip: "Percentage of total POs that have been invoiced",
          suffix: "%",
          footerContent: (
            <Typography.Text type="secondary">
              Across {poData.statistics.total_approved || 0} approved POs
            </Typography.Text>
          ),
        },
        {
          title: "% Allocated",
          value: poData.statistics.allocated_percentage,
          icon: <UpCircleOutlined />,
          bgColor: "#9254DE",
          gradient: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
          borderColor: "#D3ADF7",
          tooltip: "Percentage of total POs that have been allocated",
          suffix: "%",
          footerContent: (
            <Typography.Text type="secondary">
              Across {poData.statistics.total_approved || 0} approved POs
            </Typography.Text>
          ),
        },
      ]);
    }
  }, [poData]);

  if (isPending) {
    return (
      <Flex justify="center" align="center" style={{ height: "500px" }}>
        <Spin />
      </Flex>
    );
  }

  if (!data) {
    return (
      <Flex justify="center" align="center" style={{ height: "600px" }}>
        <Spin />
      </Flex>
    );
  }

  if (!statItems) return null;

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
  };

  const onSortHandler = (value: string) => {
    setSortOrder(value === "Date (Newest First)" ? "descend" : "ascend");
  };

  const statusChangeHandler = (value: string) => {
    setStatus(value === "All Status" ? undefined : value);
  };

  const viewChangeHandler = (value: "Card" | "Table") => {
    setViewMode(value);
    if (value === "Card") {
      setPagination({ page: 1, pageSize: 9 });
    }
    if (value === "Table") {
      setPagination({ page: 1, pageSize: 10 });
    }
  };

  const clearFiltersHandler = () => {
    setStatus("All Status");
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  return (
    <section className="mx-auto max-w-7xl">
      <div>
        <Breadcrumbs
          items={[{ title: "Home", href: "/" }, { title: "Purchase Orders" }]}
        />
        <HeaderSection
          title="Purchase Orders"
          description="Manage and track all purchase orders"
          icon={
            <ShoppingCartOutlined style={{ fontSize: 20, color: "white" }} />
          }
          hasPermission={hasPermission}
          onAddNew={() => setShowCreateModal(true)}
          buttonText="New Purchase Order"
          buttonIcon={<PlusOutlined />}
          isExport={true}
          onExport={() => {
            setShowExportCSVModal((prev) => !prev);
          }}
        />
        <StatisticsCards stats={statItems} />
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
                  defaultValue="Date (Newest First)"
                  style={{ width: 160 }}
                  onChange={onSortHandler}
                  options={[
                    {
                      value: "Date (Newest First)",
                      label: "Date (Newest First)",
                    },
                    {
                      value: "Date (Oldest First)",
                      label: "Date (Oldest First)",
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
                  value: "Draft",
                  label: "Draft",
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
          <div className="bg-[#D9D9D9] w-[1px] h-7" />
          <Segmented<"Card" | "Table">
            options={["Card", "Table"]}
            style={{ borderRadius: 9, border: "1px solid #D9D9D9" }}
            onChange={viewChangeHandler}
          />
        </Flex>
      </div>
      {viewMode === "Card" ? (
        <PoCardView
          data={data}
          pagination={pagination}
          hasPermission={hasPermission}
          paginationChangeHandler={paginationChangeHandler}
          total={total}
        />
      ) : (
        <PoTableView
          data={data}
          hasPermission={hasPermission}
          pagination={pagination}
          paginationChangeHandler={paginationChangeHandler}
          total={total}
        />
      )}

      {/* Export CSV Modal */}
      {showExportCSVModal && (
        <PurchaseOrderExportCSVModal
          open={showExportCSVModal}
          onClose={() => setShowExportCSVModal(false)}
          onExport={({ filters, columns }) => {
            if (!data) return;

            let filteredData = [...data];

            if (filters.dateFrom && filters.dateTo) {
              const from = dayjs(filters.dateFrom, "YYYY-MM-DD");
              const to = dayjs(filters.dateTo, "YYYY-MM-DD");

              filteredData = filteredData.filter((item) => {
                const d = dayjs(item.order_date, "MMM D, YYYY", true);
                return d.isValid() && d.isBetween(from, to, "day", "[]");
              });
            }

            if (filters.region) {
              filteredData = filteredData.filter(
                (item) => String(item.region) === String(filters.region)
              );
            }

            if (filters.status) {
              filteredData = filteredData.filter(
                (item) => item.purchase_order_smart_status === filters.status
              );
            }

            if (filters.currency) {
              filteredData = filteredData.filter(
                (item) => item.currency_code === filters.currency
              );
            }

            const flattened = flattenForExport(filteredData);

            exportPOToCsv(
              flattened,
              columns,
              `purchase_orders_${dayjs().format("YYYYMMDD_HH:mm:ss")}.csv`
            );
          }}
        />
      )}

      {/* Create Options Modal */}
      <CreateOptionsModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </section>
  );
}
