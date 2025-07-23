"use client";

import PoDetailView from "@/components/purchase-orders/detail/PoDetailView";
import PoUsageHistory from "@/components/purchase-orders/detail/PoUsageHistory";
import StatusBadge from "@/components/purchase-orders/StatusBadge";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const initialDetailData: PurchaseOrderDetailDto = {
  id: 1,
  purchase_order_no: "PO-123456",
  supplier: "Supplier Name",
  region: "Region Name",
  order_date: "2023-10-01",
  expected_delivery_date: "2023-10-15",
  budget: "Budget Name",
  currency_code: "THB",
  usd_exchange_rate: 33.5,
  product_items: [
    {
      id: 1,
      product_name: "Product A",
      quantity: 10,
      unit_price_local: 100,
      unit_price_usd: 10,
      sub_total_local: 1000,
      sub_total_usd: 100,
    },
    {
      id: 2,
      product_name: "Product B",
      quantity: 5,
      unit_price_local: 200,
      unit_price_usd: 20,
      sub_total_local: 1000,
      sub_total_usd: 100,
    },
  ],
  total_amount_local: 2000,
  total_amount_usd: 200,
  contact_person: "John Doe",
  sign_person: "",
  authorized_sign_person: "Alice Johnson",
  note: "This is a sample purchase order note.",
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detailData, setDetailData] =
    useState<PurchaseOrderDetailDto>(initialDetailData);
  const dropDownItems: MenuProps["items"] = [
    {
      label: <div className="text-sm !w-32 text-[#FF4D4F]">Cancel PO</div>,
      key: "cancelPO",
      icon: <StopOutlined style={{ color: "#FF4D4F" }} />,
      onClick: () => {
        alert("Cancel Purchase Order");
      },
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "details",
      label: "Details",
      children: <PoDetailView data={detailData} />,
    },
    {
      key: "usage-history",
      label: "Usage History",
      children: <PoUsageHistory />,
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <section className="px-4">
      {/* Header Section */}
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Purchase Orders" },
            { title: params.id || "Purchase Order Detail" },
          ]}
        />
        <Flex justify="space-between" align="center" className="!mb-4">
          {/* Left Header */}
          <Flex align="center" gap={16}>
            <button
              className="flex justify-center items-center"
              onClick={() => router.back()}
            >
              <ArrowLeftOutlined style={{ fontSize: 16, cursor: "pointer" }} />
            </button>
            <div>
              <Typography.Title level={3} style={{ marginBottom: 1 }}>
                {params.id || "Purchase Order Detail"}
              </Typography.Title>
              <StatusBadge status={"Approved"} />
            </div>
          </Flex>

          {/* Right Header */}
          <Flex align="center" gap={8}>
            <Button icon={<DownloadOutlined />}>Download PDF</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/purchase-orders/${params.id}/edit`)}
            >
              Edit PO
            </Button>
            <Dropdown
              menu={{ items: dropDownItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button icon={<EllipsisOutlined />} />
            </Dropdown>
          </Flex>
        </Flex>
      </div>
      {/* Purchase Order Detail Tabs */}
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
        tabBarStyle={{
          padding: "0 28px",
        }}
        onChange={onChange}
        size="large"
      />
    </section>
  );
}
