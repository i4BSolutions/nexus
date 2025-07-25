"use client";

import StockIn from "@/components/inventory/StockIn";
import StockOut from "@/components/inventory/StockOut";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useList } from "@/hooks/react-query/useList";
import { PurchaseInvoiceResponse } from "@/types/purchase-invoice/purchase-invoice.type";
import { WarehouseResponse } from "@/types/warehouse/warehouse.type";
import { SwapOutlined } from "@ant-design/icons";
import { Space, Tabs, TabsProps, Typography } from "antd";
import { useRouter } from "next/navigation";

const StockManagementPage = () => {
  const router = useRouter();
  const { data: piData, isLoading: piLoading } =
    useList<PurchaseInvoiceResponse>("purchase-invoices");

  const { data: warehousesData, isLoading: warehouseLoading } =
    useList<WarehouseResponse>("warehouses");

  const mutateStockIn = useCreate("stock-in");

  const tabItems: TabsProps["items"] = [
    {
      key: "stock-in",
      label: "Stock In",
      children: (
        <StockIn
          invoices={piData}
          invoiceLoading={piLoading}
          warehouses={warehousesData?.items}
          warehouseLoading={warehouseLoading}
          onSubmit={(payload: any) => {
            mutateStockIn.mutateAsync(payload);
          }}
          mutateStockInLoading={mutateStockIn.isPending}
        />
      ),
    },
    {
      key: "stock-out",
      label: "Stock Out",
      children: <StockOut />,
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
