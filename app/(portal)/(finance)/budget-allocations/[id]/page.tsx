"use client";

import BudgetAllocationDetails from "@/components/budget-allocations/BudgetAllocationDetails";
import BudgetAllocationLinkedPOView from "@/components/budget-allocations/BudgetAllocationLinkedPOView";
import StatusBadge from "@/components/purchase-orders/StatusBadge";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useGetById } from "@/hooks/react-query/useGetById";
import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EllipsisOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Spin,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { PurchaseOrderDto } from "../../../../../types/purchase-order/purchase-order.type";
import React, { useState } from "react";

const BudgetAllocationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const {
    data,
    isLoading: detailIsLoading,
    error: detailError,
  } = useGetById("budget-allocations", params.id as string, !!params.id);
  if (detailError) {
    message.error(detailError.message);
    return null;
  }

  if (detailIsLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  const detailData = data as BudgetAllocationsInterface;

  const dropDownItems: MenuProps["items"] = [
    {
      label: <div className="text-sm !w-32 text-[#0de246]">Approve</div>,
      key: "cancelAllocation",
      icon: <CheckCircleOutlined style={{ color: "#0de246" }} />,
      onClick: () => setCancelModalOpen(true),
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "details",
      label: "Details",
      children: <BudgetAllocationDetails data={detailData} />,
    },
    {
      key: "linked-po",
      label: "Linked PO",
      children: <BudgetAllocationLinkedPOView id={detailData.po_id} />,
    },
  ];

  return (
    <section className="px-4">
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Budget Allocations", href: "/budget-allocations" },
            {
              title: detailData.allocation_number || "Budget Allocation Detail",
            },
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
                {detailData.allocation_number || "Budget Allocation Detail"}
              </Typography.Title>
              <StatusBadge status={detailData.status} />
            </div>
          </Flex>

          {/* Right Header */}
          <Flex align="center" gap={8}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/budget-allocations/${params.id}/edit`)
              }
            >
              Edit Budget Allocation
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
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
        tabBarStyle={{
          padding: "0 28px",
        }}
        size="large"
      />
    </section>
  );
};

export default BudgetAllocationDetailPage;
