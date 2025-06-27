"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Button, Divider, message, Space, Table, Tag } from "antd";
import type { SortOrder } from "antd/es/table/interface";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import SearchAndFilters from "@/components/shared/SearchAndFilters";
import StatisticsCards from "@/components/shared/StatisticsCards";

import SupplierModal from "../../../components/suppliers/SupplierModal";

import {
  SupplierInterface,
  SuppliersResponse,
} from "@/types/supplier/supplier.type";

import { useCreate } from "@/hooks/react-query/useCreate";
import { useDelete } from "@/hooks/react-query/useDelete";
import { useList } from "@/hooks/react-query/useList";
import { useUpdate } from "@/hooks/react-query/useUpdate";

const formatField = (value: string | null | undefined) =>
  value?.trim() ? value : "N/A";

export default function SuppliersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<SupplierInterface | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>();

  const [emailDuplicateError, setEmailDuplicateError] = useState<
    string | undefined
  >();

  const router = useRouter();

  // React Query hooks
  const sortParam =
    sortField && sortOrder
      ? `${sortField}_${sortOrder === "ascend" ? "asc" : "desc"}`
      : "";

  const {
    data: suppliersData,
    isLoading: loading,
    error,
  } = useList("suppliers", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    q: searchText,
    status: statusFilter || "",
    sort: sortParam,
  });

  const create = useCreate("suppliers");
  const update = useUpdate("suppliers");

  // Extract data from the query result
  const suppliers = (suppliersData as SuppliersResponse)?.items || [];
  const total = (suppliersData as SuppliersResponse)?.total || 0;
  const counts = {
    total: (suppliersData as SuppliersResponse)?.statistics?.total || 0,
    active: (suppliersData as SuppliersResponse)?.statistics?.active || 0,
    inactive: (suppliersData as SuppliersResponse)?.statistics?.inactive || 0,
  };

  // Handle errors
  if (error) {
    message.error("Error fetching suppliers");
  }

  const handleView = (supplier: SupplierInterface) => {
    router.push(`/suppliers/${supplier.id}`);
  };

  const handleEdit = (supplier: SupplierInterface) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const isEdit = Boolean(editingSupplier);

    try {
      if (isEdit) {
        await update.mutateAsync({
          id: editingSupplier!.id.toString(),
          data: values,
        });
        message.success("Updated successfully");
      } else {
        await create.mutateAsync(values);
        message.success("Created successfully");
      }

      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (error: any) {
      if (error?.message?.includes("supplier_email_key")) {
        setEmailDuplicateError("Existing email address");
      }
      message.error(error?.message || "Operation failed");
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
      title: "SUPPLIER NAME",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortField === "name" ? (sortOrder as SortOrder) : undefined,
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "CONTACT PERSON",
      dataIndex: "contact_person",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "ADDRESS",
      dataIndex: "address",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "STATUS",
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
      title: "ACTIONS",
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
        onSearch={(text) => {
          setSearchText(text);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatusFilter(value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }
        }}
        onClearFilters={() => {
          setStatusFilter(undefined);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {/* Table */}
      <Table
        bordered
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: total,
        }}
        onChange={(paginationInfo, filters, sorter) => {
          // Handle pagination
          setPagination({
            page: paginationInfo.current ?? 1,
            pageSize: paginationInfo.pageSize ?? 10,
          });

          // Handle sorting
          if (Array.isArray(sorter)) {
            const sortInfo = sorter[0];
            setSortField(sortInfo?.field as string);
            setSortOrder(sortInfo?.order);
          } else {
            setSortField(sorter?.field as string);
            setSortOrder(sorter?.order);
          }
        }}
      />

      <SupplierModal
        open={isModalOpen}
        isEdit={!!editingSupplier}
        initialValues={editingSupplier ?? undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
          setEmailDuplicateError(undefined);
        }}
        onSubmit={handleSubmit}
        emailDuplicateError={emailDuplicateError}
        onEmailChange={() => setEmailDuplicateError("")}
      />
    </section>
  );
}
