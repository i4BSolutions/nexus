"use client";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { App, Button, Space, Tabs, Tag, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";

import { SupplierInterface } from "@/types/supplier/supplier.type";

import { useDelete } from "@/hooks/react-query/useDelete";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";

import DetailsCard from "@/components/suppliers/DetailsCard";
import HistoryCard from "@/components/suppliers/HistoryCard";
import SupplierModal from "@/components/suppliers/SupplierModal";
import { usePermission } from "@/hooks/shared/usePermission";

const SupplierPage = () => {
  const hasPermission = usePermission("can_manage_products_suppliers");
  const { message } = App.useApp();

  const params = useParams();
  const id = params?.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();

  const {
    data: supplierRaw,
    isLoading,
    error,
    refetch,
  } = useGetById("suppliers", id, !!id);
  const update = useUpdate("suppliers");
  const remove = useDelete("suppliers");

  const supplier = supplierRaw as SupplierInterface;

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(id);
      message.success("Supplier deleted");
      router.push("/suppliers");
    } catch (err: any) {
      message.error(err?.message || "Delete failed");
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      await update.mutateAsync({ id, data: values });
      message.success("Supplier updated");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err?.message || "Update failed");
    }
  };

  if (isLoading) return null;
  if (error || !supplier) return null;

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Suppliers", href: "/suppliers" },
          { title: `Supplier ${id}`, href: `/suppliers/${id}` },
        ]}
      />

      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            type="link"
            onClick={() => router.back()}
            style={{ fontSize: 20, color: "#000" }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              {supplier.name}
            </Typography.Title>
            <Tag
              color={supplier.status ? "green" : "red"}
              style={{ marginTop: 0 }}
            >
              {supplier.status ? "Active" : "Inactive"}
            </Tag>
          </Space>
        </Space>

        {hasPermission && (
          <Space>
            <DeleteConfirmModal
              open={isDeleteModalOpen}
              title="Supplier"
              onCancel={() => setIsDeleteModalOpen(false)}
              onConfirm={async () => {
                await handleDelete();
                setIsDeleteModalOpen(false);
              }}
            />

            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => setIsDeleteModalOpen(true)}
            />

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Edit Supplier
            </Button>
          </Space>
        )}
      </Space>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: "Details",
            children: (
              <DetailsCard
                contact_person={supplier.contact_person}
                email={supplier.email}
                phone={supplier.phone}
                address={supplier.address}
              />
            ),
          },
          {
            key: "history",
            label: "History",
            children: <HistoryCard id={id} />,
          },
        ]}
      />

      <SupplierModal
        open={isModalOpen}
        isEdit={true}
        initialValues={supplier}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </section>
  );
};

export default SupplierPage;
