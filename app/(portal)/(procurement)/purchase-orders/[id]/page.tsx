"use client";

import PoCancelModal from "@/components/purchase-orders/detail/PoCancelModal";
import PoDetailPDF from "@/components/purchase-orders/detail/PoDetailPdf";
import PoDetailView from "@/components/purchase-orders/detail/PoDetailView";
import PoUsageHistory from "@/components/purchase-orders/detail/PoUsageHistory";
import StatusBadge from "@/components/purchase-orders/StatusBadge";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
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
import { useState } from "react";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data: detailData, isLoading } = useGetById<PurchaseOrderDetailDto>(
    "purchase-orders",
    params.id as string,
    !!params.id
  );

  const updatePurchaseOrder = useUpdate("purchase-orders", [
    "purchase-orders",
    params.id as string,
  ]);

  const dropDownItems: MenuProps["items"] = [
    {
      label: <div className="text-sm !w-32 text-[#FF4D4F]">Cancel PO</div>,
      key: "cancelPO",
      icon: <StopOutlined style={{ color: "#FF4D4F" }} />,
      onClick: () => setCancelModalOpen(true),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid place-items-center h-screen">
        <Spin />
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="grid place-items-center h-screen">
        Purchase Order not found
      </div>
    );
  }

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

  const onCancelPOHandler = async () => {
    // try {
    //   await updatePurchaseOrder.mutateAsync({
    //     id: params.id as string,
    //     data: { status: "Rejected", reason: "Rejected PO" },
    //   });
    //   message.success("Purchase Order cancelled successfully");
    // } catch (error) {
    //   message.error("Failed to cancel Purchase Order");
    //   console.error("Error cancelling Purchase Order:", error);
    // }
    alert("This feature is not implemented yet.");
  };

  return (
    <section className="px-4">
      {/* Header Section */}
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Purchase Orders", href: "/purchase-orders" },
            { title: detailData.purchase_order_no || "Purchase Order Detail" },
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
                {detailData.purchase_order_no || "Purchase Order Detail"}
              </Typography.Title>
              <StatusBadge status={detailData.status} />
            </div>
          </Flex>

          {/* Right Header */}
          <Flex align="center" gap={8}>
            <Button icon={<DownloadOutlined />}>
              <PDFDownloadLink
                document={<PoDetailPDF data={detailData} />}
                fileName={`PO_${detailData.id}.pdf`}
              >
                Download PDF
              </PDFDownloadLink>
            </Button>
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
        size="large"
      />
      <PoCancelModal
        cancelModalOpen={cancelModalOpen}
        setCancelModalOpen={setCancelModalOpen}
        onProceedHandler={onCancelPOHandler}
      />
    </section>
  );
}
