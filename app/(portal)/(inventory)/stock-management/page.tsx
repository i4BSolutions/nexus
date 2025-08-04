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
import { Space, Tabs, TabsProps, Typography } from "antd";

const StockManagementPage = () => {
  const canStockIn = usePermission("can_stock_in");
  const canStockOut = usePermission("can_stock_out");

  const { data: piData, isLoading: piLoading } =
    useList<PurchaseInvoiceResponse>("purchase-invoices");

  const { data: warehousesData, isLoading: warehouseLoading } =
    useList<WarehouseResponse>("warehouses");

  const { data: stockInHistoryData, isLoading: stockInHistoryLoading } =
    useList<StockTransactionHistory[]>("stock-in/history");

  const { data: stockOutHistoryData, isLoading: stockOutHistoryLoading } =
    useList<StockTransactionHistory[]>("stock-out/history");

  const mutateStockIn = useCreate("stock-in");
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
          invoices={piData}
          invoiceLoading={piLoading}
          warehouses={warehousesData?.items}
          stockInHistories={stockInHistoryData}
          warehouseLoading={warehouseLoading}
          stockInHistoryLoading={stockInHistoryLoading}
          onSubmit={(payload: any) => {
            mutateStockIn.mutateAsync(payload);
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
    <section className="px-6 grid place-items-center w-full pb-3">
      <div className="w-full max-w-[1140px]">
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
