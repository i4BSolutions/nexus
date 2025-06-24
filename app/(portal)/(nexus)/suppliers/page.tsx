"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Table, Button, message, Tag, Space, Divider, Breadcrumb } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderSection from "@/components/HeaderSection";
import StatisticsCards from "@/components/StatisticsCards";
import SearchAndFilters from "@/components/SearchAndFilters";

import { SupplierInterface } from "@/types/supplier/supplier.type";

const formatField = (value: string | null | undefined) =>
  value?.trim() ? value : "N/A";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<SupplierInterface | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });

  const router = useRouter();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/suppliers?page=${pagination.page}&pageSize=${
          pagination.pageSize
        }&status=${statusFilter || ""}&q=${searchText}`
      );

      const result = await res.json();

      if (res.ok && result.status === "success") {
        setSuppliers(result.data.items || []);
        setPagination((prev) => ({
          ...prev,
          page: result.data.page,
          pageSize: result.data.pageSize,
        }));
        setCounts((prev) => ({
          ...prev,
          total: result.data.total,
        }));
      } else {
        message.error(result.message || "Failed to fetch suppliers");
      }
    } catch {
      message.error("Error fetching suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.page, pagination.pageSize, statusFilter, searchText]);

  const handleView = (supplier: SupplierInterface) => {
    router.push(`/suppliers/${supplier.id}`);
  };

  const handleEdit = (supplier: SupplierInterface) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const isEdit = Boolean(editingSupplier);
    const url = isEdit
      ? `/api/suppliers/${editingSupplier!.id}`
      : `/api/suppliers`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        message.success(`${isEdit ? "Updated" : "Created"} successfully`);
        fetchSuppliers();
        setIsModalOpen(false);
        setEditingSupplier(null);
      } else {
        message.error(result.message || "Operation failed");
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      options: [
        { label: "All Status", value: "" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  const columns = [
    {
      title: "Supplier Name",
      dataIndex: "name",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Email",
      dataIndex: "email",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Status",
      dataIndex: "status",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (_: any, record: SupplierInterface) =>
        record.status ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "Actions",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (_: any, record: SupplierInterface) => (
        <Space style={{ display: "flex", gap: 0 }}>
          <Button
            type="link"
            onClick={() => handleView(record)}
            style={{ padding: 0 }}
          >
            View
          </Button>
          <Divider type="vertical" />
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Suppliers" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Suppliers"
        description="Manage your supplier directory"
        icon={<ShopOutlined />}
        onAddNew={() => {
          setEditingSupplier(null);
          setIsModalOpen(true);
        }}
        buttonText="New Supplier"
        buttonIcon={<PlusOutlined />}
      />

      {/* Statistics */}
      <StatisticsCards
        stats={[
          {
            title: "Total Suppliers",
            value: counts.total,
            icon: <ShopOutlined />,
            bgColor: "#40A9FF",
            gradient: "linear-gradient(90deg, #e6f7ff 0%, #fff 100%)",
            borderColor: "#91D5FF",
          },
          {
            title: "Active Suppliers",
            value: counts.active,
            icon: <CheckCircleOutlined />,
            bgColor: "#73D13D",
            gradient: "linear-gradient(90deg, #f6ffed 0%, #fff 100%)",
            borderColor: "#B7EB8F",
          },
          {
            title: "Inactive Suppliers",
            value: counts.inactive,
            icon: <CloseCircleOutlined />,
            bgColor: "#D9D9D9",
            gradient: "linear-gradient(90deg, #fafafa 0%, #fff 100%)",
            borderColor: "#F5F5F5",
          },
        ]}
      />

      {/* Search and Filter */}
      <SearchAndFilters
        searchPlaceholder="Search by name, contact or email"
        onSearch={(text) => setSearchText(text)}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value);
        }}
        onClearFilters={() => {
          setStatusFilter(undefined);
        }}
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: counts.total,
        }}
        onChange={(paginationInfo) => {
          setPagination({
            page: paginationInfo.current ?? 1,
            pageSize: paginationInfo.pageSize ?? 10,
          });
        }}
        bordered
      />
    </section>
  );
}
