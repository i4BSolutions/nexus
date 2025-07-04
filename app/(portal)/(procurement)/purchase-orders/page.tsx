"use client";

import CardView from "@/components/purchase-orders/CardView";
import TableView from "@/components/purchase-orders/TableView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import StatisticsCards from "@/components/shared/StatisticsCards";
import { PurchaseOrderType } from "@/types/purchase-order/po.type";
import { StatItem } from "@/types/shared/stat-item.type";
import {
  DollarOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Segmented, Select } from "antd";
import { SearchProps } from "antd/es/input";
import { useState } from "react";

const initialStatItems = [
  {
    title: "Total POs",
    value: 12,
    icon: <ShoppingCartOutlined />,
    bgColor: "#40A9FF",
    gradient: "linear-gradient(90deg, #E6F7FF 0%, #FFF 100%)",
    borderColor: "#91d5ff",
    tooltip: "Total number of purchase orders",
  },
  {
    title: "Total USD Value",
    value: 25000,
    icon: <DollarOutlined />,
    bgColor: "#36CFC9",
    gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
    borderColor: "#87E8DE",
    tooltip: "Total value of all purchase orders",
    prefix: "$",
  },
  {
    title: "% Invoiced",
    value: 75,
    icon: <DollarOutlined />,
    bgColor: "#597EF7",
    gradient: "linear-gradient(90deg, #F0F5FF 0%, #FFF 100%)",
    borderColor: "#ADC6FF",
    tooltip: "Percentage of total POs that have been invoiced",
    suffix: "%",
  },
  {
    title: "% Allocated",
    value: 50,
    icon: <UpCircleOutlined />,
    bgColor: "#9254DE",
    gradient: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
    borderColor: "#D3ADF7",
    tooltip: "Percentage of total POs that have been allocated",
    suffix: "%",
  },
];

const dummyData: PurchaseOrderType[] = [
  {
    id: "PO-2025-1234",
    order_date: "2025-01-15",
    status: "Draft",
    amount: 150000,
    contact_person: "John Doe",
    expected_delivery_date: "2025-02-01",
    total_invoice_amount: 0,
    total_allocated_amount: 0,
  },
  {
    id: "PO-2025-1235",
    order_date: "2025-01-20",
    status: "Approved",
    amount: 3000,
    contact_person: "Jane Smith",
    expected_delivery_date: "2025-02-05",
    total_invoice_amount: 1500,
    total_allocated_amount: 1500,
  },
  {
    id: "PO-2025-1236",
    order_date: "2025-01-25",
    status: "Draft",
    amount: 2000,
    contact_person: "Alice Johnson",
    expected_delivery_date: "2025-02-10",
    total_invoice_amount: 0,
    total_allocated_amount: 0,
  },
  {
    id: "PO-2025-1237",
    order_date: "2025-01-30",
    status: "Approved",
    amount: 5000,
    contact_person: "Bob Brown",
    expected_delivery_date: "2025-02-15",
    total_invoice_amount: 5000,
    total_allocated_amount: 5000,
  },
  {
    id: "PO-2025-1238",
    order_date: "2025-02-05",
    status: "Draft",
    amount: 2500,
    contact_person: "Charlie Green",
    expected_delivery_date: "2025-02-20",
    total_invoice_amount: 0,
    total_allocated_amount: 0,
  },
];

export default function PurchaseOrdersPage() {
  const [statItems, setStatItems] = useState<StatItem[]>(initialStatItems);
  const [viewMode, setViewMode] = useState<"Card" | "Table">("Card");
  const [data, setData] = useState<PurchaseOrderType[]>(dummyData);

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) =>
    console.log(info?.source, value);

  const onSortHandler = (value: string) => {
    console.log(`selected ${value}`);
  };

  const statusChangeHandler = (value: string) => {
    console.log(`selected ${value}`);
  };

  const viewChangeHandler = (value: "Card" | "Table") => {
    setViewMode(value);
    console.log(`View changed to ${value}`);
  };

  return (
    <section className="px-6">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Purchase Orders" }]}
      />
      <HeaderSection
        title="Purchase Orders"
        description="Manage and track all purchase orders"
        icon={<ShoppingCartOutlined style={{ fontSize: 20, color: "white" }} />}
        onAddNew={() => console.log("Add New Purchase Order")}
        buttonText="New Purchase Order"
        buttonIcon={<PlusOutlined />}
      />
      <StatisticsCards stats={statItems} />
      <Flex justify="center" align="center" gap={12}>
        <Input.Search
          placeholder="Search By PO Number"
          allowClear
          onSearch={onSearchHandler}
        />
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
            onClick={() => console.log("Clear Filters")}
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
        <CardView data={data} />
      ) : (
        <TableView data={data} />
      )}
    </section>
  );
}
