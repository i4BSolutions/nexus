"use client";

import PoDetailPDF from "@/components/purchase-orders/detail/PoDetailPdf";
import PoDetailView from "@/components/purchase-orders/detail/PoDetailView";
import PoUsageHistory from "@/components/purchase-orders/detail/PoUsageHistory";
import StatusBadge from "@/components/purchase-orders/StatusBadge";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useGetById } from "@/hooks/react-query/useGetById";
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

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const [detailData, setDetailData] =
  //   useState<PurchaseOrderDetailDto>(initialDetailData);

  const { data: detailData, isLoading } = useGetById<PurchaseOrderDetailDto>(
    "purchase-orders",
    params.id as string,
    !!params.id
  );

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
              <StatusBadge status={"Approved"} />
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
    </section>
  );
}
