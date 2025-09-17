"use client";

import Inventory from "@/components/inventory/stock-management/Inventory";
import StockIn from "@/components/inventory/stock-management/StockIn";
import StockOut from "@/components/inventory/stock-management/StockOut";
import Transactions from "@/components/inventory/stock-management/Transactions";
import AccessDenied from "@/components/shared/AccessDenied";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useList } from "@/hooks/react-query/useList";
import { usePermission } from "@/hooks/shared/usePermission";
import { PurchaseInvoiceResponse } from "@/types/purchase-invoice/purchase-invoice.type";
import { StockTransactionHistory } from "@/types/stock/stock.type";
import { WarehouseResponse } from "@/types/warehouse/warehouse.type";
import { SwapOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { App, Space, Tabs, TabsProps, Typography } from "antd";

const createStockIn = async (formData: FormData) => {
  const res = await fetch("/api/stock-in", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create stock in");
  return data;
};

const StockManagementPage = () => {
  const { message } = App.useApp();
  const canStockIn = usePermission("can_stock_in");
  const canStockOut = usePermission("can_stock_out");

  const { data: piData, isLoading: piLoading } =
    useList<PurchaseInvoiceResponse>("purchase-invoices");

  const filteredInvoices = piData?.items.filter(
    (invoice) => invoice.is_voided !== true
  );

  const { data: warehousesData, isLoading: warehouseLoading } =
    useList<WarehouseResponse>("warehouses", {
      page: 1,
      pageSize: 100,
    });

  const { data: stockInHistoryData, isLoading: stockInHistoryLoading } =
    useList<StockTransactionHistory[]>("stock-in/history");

  const { data: stockOutHistoryData, isLoading: stockOutHistoryLoading } =
    useList<StockTransactionHistory[]>("stock-out/history");

  const mutateStockIn = useMutation({
    mutationFn: createStockIn,
    onSuccess: () => {
      message.success("Stock In completed successfully!");
    },
    onError: (error: any) => {
      message.error(error.message || "Unexpected error");
    },
  });
  const mutateStockOut = useCreate("stock-out");

  const tabItems: TabsProps["items"] = [
    {
      key: "inventory",
      label: "Inventory",
      children: <Inventory />,
    },
    {
      key: "stock-in",
      label: "Stock In",
      children: canStockIn ? (
        <StockIn
          invoices={filteredInvoices}
          invoiceLoading={piLoading}
          warehouses={warehousesData?.items}
          stockInHistories={stockInHistoryData}
          warehouseLoading={warehouseLoading}
          stockInHistoryLoading={stockInHistoryLoading}
          onSubmit={async (payload: any) => {
            try {
              // payload.invoice_items[i].__files__ is File[]
              const meta = payload.invoice_items.map((it: any) => ({
                product_id: it.product_id,
                warehouse_id: it.warehouse_id,
                quantity: it.quantity,
                invoice_line_item_id: it.invoice_line_item_id,
              }));

              const fd = new FormData();
              fd.append("invoice_items", JSON.stringify(meta));

              // Attach files per row as evidence_{index}
              payload.invoice_items.forEach((it: any, idx: number) => {
                const files: File[] = it.__files__ ?? [];
                files.forEach((f) => fd.append(`evidence_photo`, f));
              });

              // If your useCreate hook accepts FormData, great:
              const response: any = await mutateStockIn.mutateAsync(fd);

              const msg = Array.isArray(response)
                ? response[0]?.message
                : "Stock In completed successfully!";
              message.success(msg);
            } catch (err: any) {
              const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Stock In failed.";
              message.error(apiMessage);
            }
          }}
          mutateStockInLoading={mutateStockIn.isPending}
        />
      ) : (
        <AccessDenied />
      ),
    },
    {
      key: "stock-out",
      label: "Stock Out",
      children: canStockOut ? (
        <StockOut
          warehouses={warehousesData?.items}
          warehouseLoading={warehouseLoading}
          stockOutHistories={stockOutHistoryData}
          stockOutHistoryLoading={stockOutHistoryLoading}
          onSubmit={(payload: any) => {
            mutateStockOut.mutateAsync(payload);
          }}
        />
      ) : (
        <AccessDenied />
      ),
    },
    {
      key: "transactions",
      label: "Transactions",
      children: <Transactions />,
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div className="w-full">
        <Breadcrumbs
          items={[{ title: "Home", href: "/" }, { title: "Stock Management" }]}
        />
        <Space
          size="small"
          style={{
            display: "flex",
            marginBottom: "16px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#9254DE",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SwapOutlined style={{ fontSize: 20, color: "#FFFFFF" }} />
          </div>
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              Stock Management
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Monitor and manage your inventory across warehouses
            </Typography.Paragraph>
          </Space>
        </Space>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          tabBarStyle={{
            padding: "0 28px",
          }}
          onChange={onChange}
          size="large"
        />
      </div>
    </section>
  );
};

export default StockManagementPage;
