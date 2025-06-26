"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Button, Tag, Tabs, Space, message } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

import Breadcrumbs from "@/components/Breadcrumbs";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

import { SupplierInterface } from "@/types/supplier/supplier.type";

import DetailsCard from "../components/DetailsCard";
import HistoryCard from "../components/HistoryCard";
import SupplierModal from "../components/SupplierModal";

const SupplierPage = () => {
  const params = useParams();
  const id = params?.id;

  const [supplier, setSupplier] = useState<SupplierInterface | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/suppliers/${id}`);
      const result = await res.json();
      if (res.ok && result.status === "success") {
        setSupplier(result.data);
      } else {
        message.error("Failed to fetch supplier");
      }
    } catch {
      message.error("Error fetching supplier");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        message.success("Supplier deleted");
        router.push("/suppliers");
      } else {
        message.error("Delete failed");
      }
    } catch {
      message.error("Delete error");
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        message.success("Supplier updated");
        setIsModalOpen(false);
        fetchSupplier();
      } else {
        message.error(result.message || "Update failed");
      }
    } catch {
      message.error("Update error");
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  if (!supplier) return null;

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
            children: <HistoryCard />,
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
