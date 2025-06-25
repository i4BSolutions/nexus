"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Tag,
  Tabs,
  Card,
  Row,
  Col,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

import Breadcrumbs from "@/components/Breadcrumbs";
import DetailsCard from "../components/DetailsCard";
import HistoryCard from "../components/HistoryCard";

import { SupplierInterface } from "@/types/supplier/supplier.type";

const SupplierPage = () => {
  const params = useParams();
  const id = params?.id;

  const [supplier, setSupplier] = useState<SupplierInterface | null>(null);

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
          <Popconfirm
            title="Are you sure to delete this supplier?"
            onConfirm={handleDelete}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(`/suppliers/edit/${id}`)}
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
    </section>
  );
};

export default SupplierPage;
