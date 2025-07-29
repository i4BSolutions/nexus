"use client";

// React & Next
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Components
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  EditOutlined,
  InboxOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import StatisticsCards from "@/components/shared/StatisticsCards";

import { StatItem } from "@/types/shared/stat-item.type";
import { App, Flex, Progress, Spin, Tabs } from "antd";

import { useWarehouseDetails } from "@/hooks/warehouse/warehouseDetails";
import WarehouseInventoryTable from "@/components/warehouses/WarehouseInventoryTable";
import WarehouseStockMovementsTable from "@/components/warehouses/WarehouseStockMovementsTable";
import WarehouseModal from "@/components/warehouses/WarehouseModal";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { useUpdate } from "@/hooks/react-query/useUpdate";

export default function WarehouseDetailsPage() {
  const { message } = App.useApp();

  const params = useParams();

  const id = params?.id as string;
  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "stock_movements">(
    "inventory"
  );
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseInterface | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const { data, warehouseData, total, loading } = useWarehouseDetails(
    id as string,
    activeTab,
    pagination.page,
    pagination.pageSize,
    searchText,
    isUpdated
  );

  const update = useUpdate("warehouses");

  const handleEdit = () => {
    setEditingWarehouse({
      id: warehouseData?.warehouse?.id || 0,
      name: warehouseData?.warehouse?.name || "",
      location: warehouseData?.warehouse?.location || "",
      capacity: warehouseData?.warehouse?.capacity || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      await update.mutateAsync({
        id: editingWarehouse!.id.toString(),
        data: values,
      });

      message.success("Updated successfully");
      setIsModalOpen(false);
      setEditingWarehouse(null);
      setIsUpdated(true);
    } catch (error: any) {
      message.error(error?.message || "Operation failed");
    }
  };

  useEffect(() => {
    if (warehouseData) {
      setStatItems([
        {
          title: "Warehouse Capacity",
          value: warehouseData.total_item_count || 0,
          suffix: `/${warehouseData?.warehouse?.capacity}`,
          icon: <InboxOutlined />,
          bgColor: "#9254DE",
          gradient: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
          borderColor: "#D3ADF7",
          tooltip: "Total number of warehouse capacity",
          footerContent: (
            <Progress
              percent={
                (warehouseData.total_item_count /
                  warehouseData.warehouse.capacity) *
                100
              }
              strokeColor="#9254DE"
            />
          ),
        },
        {
          title: "Total Stock Value",
          prefix: "$",
          value: warehouseData.total_stock_value,
          icon: <DollarOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Total value of in stock items",
        },
        {
          title: "Stock Movement",
          value: {
            in: warehouseData.stock_in,
            out: warehouseData.stock_out,
          },
          icon: <SwapOutlined />,
          bgColor: "#597EF7",
          gradient: "linear-gradient(90deg, #F0F5FF 0%, #FFF 100%)",
          borderColor: "#ADC6FF",
          tooltip: "Stock Movement",
        },
      ]);
    }
  }, [warehouseData]);

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <>
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { title: "Home", href: "/" },
              { title: "Warehouses", href: "/warehouses" },
              { title: `${warehouseData?.warehouse?.name ?? ""}` },
            ]}
          />

          {/* Header Section */}
          <HeaderSection
            title={`${warehouseData?.warehouse?.name ?? ""}`}
            description={`${warehouseData?.warehouse?.location ?? ""}`}
            bgColor="transparent"
            iconColor="black"
            icon={<ArrowLeftOutlined />}
            onAddNew={() => {
              handleEdit();
            }}
            buttonText="Edit Warehouse"
            buttonIcon={<EditOutlined />}
          />

          {/* Statistics Cards */}
          <StatisticsCards stats={statItems} />

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key as any);
              setPagination({ page: 1, pageSize: 10 });
              setSearchText("");
            }}
            items={[
              {
                key: "inventory",
                label: "Inventory",
                children: (
                  <WarehouseInventoryTable
                    data={data}
                    total={total}
                    pagination={pagination}
                    onPageChange={setPagination}
                    onSearch={setSearchText}
                  />
                ),
              },
              {
                key: "stock_movements",
                label: "Stock Movements",
                children: (
                  <WarehouseStockMovementsTable
                    data={data}
                    total={total}
                    pagination={pagination}
                    onPageChange={setPagination}
                    onSearch={setSearchText}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      <WarehouseModal
        open={isModalOpen}
        isEdit={true}
        initialValues={editingWarehouse ?? undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
