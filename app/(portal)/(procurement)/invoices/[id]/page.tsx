"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";

import Breadcrumbs from "@/components/shared/Breadcrumbs";

import DetailsCard from "@/components/purchase-invoices/DetailsCard";
import PiDetailPDF from "@/components/purchase-invoices/DetailsPDF";
import EditHistory from "@/components/purchase-invoices/EditHistory";
import LinkedPO from "@/components/purchase-invoices/LinkedPO";

import {
  PurchaseInvoiceHistory,
  PurchaseInvoiceInterface,
} from "@/types/purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";

import VoidModal from "@/components/purchase-invoices/VoidModal";
import { getAuthenticatedUser } from "@/helper/getUser";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { createClient } from "@/lib/supabase/client";

export default function PiDetailsPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const authenticatedUser = await getAuthenticatedUser(createClient());
      setHasPermission(
        authenticatedUser.user_metadata.permissions.can_manage_invoices
      );
    };
    fetchUser();
  }, []);

  const {
    data: invoiceDataRaw,
    isLoading,
    error,
  } = useGetById("purchase-invoices", id, !!id);

  const invoiceData = invoiceDataRaw as PurchaseInvoiceInterface;

  const {
    data: poDataRaw,
    isLoading: poLoading,
    error: poError,
  } = useGetById(
    "purchase-orders",
    invoiceData?.purchase_order_id as string,
    !!invoiceData?.purchase_order_id
  );

  const poData = poDataRaw as { data: PurchaseOrderDetailDto };

  const {
    data: historyDataRaw,
    isLoading: historyLoading,
    error: historyError,
  } = useGetById("purchase-invoices/edit-history", id, !!id);

  const historyData = historyDataRaw as PurchaseInvoiceHistory[];

  const dropDownItems: MenuProps["items"] = [
    {
      label: <div className="text-sm !w-32 text-[#FF4D4F]">Void Invoice</div>,
      key: "cancelPO",
      icon: <StopOutlined style={{ color: "#FF4D4F" }} />,
      onClick: () => {
        setIsModalOpen(true);
      },
    },
  ];

  const updateData = useUpdate("purchase-invoices");

  const handleOnClickVoid = async (isVoided: boolean): Promise<void> => {
    try {
      await updateData.mutateAsync({
        id,
        data: { is_voided: isVoided },
      });

      message.success("Invoice voided successfully");
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error.message || "Failed to update invoice");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const isAnyLoading = isLoading || poLoading || historyLoading;

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      {isAnyLoading ? (
        <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
          <Spin size="large" />
        </Flex>
      ) : error || poError || historyError ? (
        <Typography.Text type="danger">
          Failed to load invoice details. Please try again later.
        </Typography.Text>
      ) : (
        <div className="gap-2 flex flex-col">
          {/* Breadcrumbs Section */}
          <Breadcrumbs
            items={[
              { title: "Home", href: "/" },
              { title: "Invoices", href: "/invoices" },
              { title: `${invoiceData?.purchase_invoice_number}` },
            ]}
          />

          {/* Header Section */}
          <Flex justify="space-between" align="center" className="!mb-4">
            {/* Left Section */}
            <Flex align="center" gap={16}>
              <Button
                icon={<ArrowLeftOutlined />}
                type="link"
                onClick={() => router.back()}
                style={{ fontSize: 20, color: "#000" }}
              />
              <Space direction="vertical" size={0}>
                <Typography.Title level={3} style={{ marginBottom: 0 }}>
                  {invoiceData?.purchase_invoice_number}
                </Typography.Title>
                {invoiceData?.is_voided ? (
                  <Tag color="red" style={{ marginTop: 0 }}>
                    Voided
                  </Tag>
                ) : (
                  <Tag
                    color={invoiceData?.status ? "green" : "red"}
                    style={{ marginTop: 0 }}
                  >
                    {invoiceData?.status}
                  </Tag>
                )}
              </Space>
            </Flex>

            {/* Right Section */}
            {invoiceData?.is_voided ? (
              <></>
            ) : (
              <Flex align="center" gap={8}>
                <Button icon={<DownloadOutlined />}>
                  <PDFDownloadLink
                    document={<PiDetailPDF data={invoiceData ?? []} />}
                    fileName={`PI_${id}.pdf`}
                  >
                    Download PDF
                  </PDFDownloadLink>
                </Button>
                {hasPermission && (
                  <>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => router.push(`/invoices/${params.id}/edit`)}
                    >
                      Edit Invoice
                    </Button>
                    <Dropdown
                      menu={{ items: dropDownItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button icon={<EllipsisOutlined />} />
                    </Dropdown>
                  </>
                )}
              </Flex>
            )}
          </Flex>

          {invoiceData?.is_voided && (
            <Alert
              message="This invoice has been voided."
              description="The invoice is no longer active and won’t be processed."
              type="error"
              icon={<CloseCircleOutlined />}
              showIcon
            />
          )}

          <Tabs
            defaultActiveKey="details"
            items={[
              {
                key: "details",
                label: "Details",
                children: <DetailsCard data={invoiceData} />,
              },
              {
                key: "linked-po",
                label: "Linked PO",
                children: <LinkedPO data={poData} />,
              },
              {
                key: "edit-history",
                label: "Edit History",
                children: <EditHistory data={historyData} />,
              },
            ]}
          />

          <VoidModal
            open={isModalOpen}
            onClose={handleModalClose}
            onSave={() => handleOnClickVoid(true)}
          />
        </div>
      )}
    </section>
  );
}
