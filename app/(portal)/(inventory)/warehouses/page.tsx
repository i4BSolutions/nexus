"use client";

// React & Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// Components
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import SearchAndFilters from "@/components/shared/SearchAndFilters";
import WarehouseModal from "@/components/warehouses/WarehouseModal";

// Types
import {
  WarehouseInterface,
  WarehouseResponse,
} from "@/types/warehouse/warehouse.type";

// Ant Design
import {
  App,
  Button,
  Divider,
  Flex,
  Pagination,
  Space,
  Table,
  TableProps,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

// Hooks
import { useCreate } from "@/hooks/react-query/useCreate";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { useList } from "@/hooks/react-query/useList";

export default function WarehousePage() {
  const { message } = App.useApp();

  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseInterface | null>(null);

  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const create = useCreate("warehouses");
  const update = useUpdate("warehouses");

  const {
    data: warehouseData,
    isLoading: loading,
    error,
  } = useList("warehouses", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    q: searchText,
  });

  const warehouses = (warehouseData as WarehouseResponse)?.items || [];

  const total = (warehouseData as WarehouseResponse)?.total || 0;

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  const handleSubmit = async (values: any) => {
    const isEdit = Boolean(editingWarehouse);

    try {
      if (isEdit) {
        await update.mutateAsync({
          id: editingWarehouse!.id.toString(),
          data: values,
        });

        message.success("Updated successfully");
      } else {
        await create.mutateAsync(values);
        message.success("Created successfully");
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
    } catch (error: any) {
      message.error(error?.message || "Operation failed");
    }
  };

  const handleEdit = (warehosue: WarehouseInterface) => {
    setEditingWarehouse(warehosue);
    setIsModalOpen(true);
  };

  const formatField = (value: string | null | undefined) =>
    value ? value : "N/A";

  const columns: TableProps<WarehouseInterface>["columns"] = [
    {
      title: "WAREHOUSE NAME",
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "LOCATION",
      dataIndex: "location",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "CAPACITY",
      dataIndex: "capacity",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.capacity - b.capacity,
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (formatField) => (
        <div>
          <Typography.Text>
            {formatField.toLocaleString()} Units
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Total Items in hand",
      dataIndex: "total_items",
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.total_items ?? 0) - (b.total_items ?? 0),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (formatField) => (
        <div>
          <Typography.Text>
            {formatField.toLocaleString()} Units
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Total value (USD)",
      dataIndex: "total_amount",
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.total_amount ?? 0) - (b.total_amount ?? 0),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (formatField) => (
        <div>
          <Typography.Text>{formatField.toLocaleString()} USD</Typography.Text>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      render: (_: any, record: WarehouseInterface) => (
        <Space style={{ display: "flex", gap: 0 }}>
          <Button
            type="link"
            onClick={() => router.push(`/warehouses/${record.id}`)}
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
        items={[{ title: "Home", href: "/" }, { title: "Warehouses" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Warehouses"
        description="Manage your warehouses and distribution centers"
        bgColor="#9254DE"
        icon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.1368 6.26065L11.3868 0.978844C10.5708 0.339897 9.43 0.339897 8.614 0.978844L1.86325 6.26065C1.315 6.68962 1 7.33606 1 8.03276V18.4996H5.5V10.2503C5.5 9.8371 5.836 9.50038 6.25 9.50038H13.75C14.164 9.50038 14.5 9.8371 14.5 10.2503V18.4996H19V8.03276C19 7.33606 18.685 6.68962 18.1368 6.26065ZM17.5 16.9998H16V10.2503C16 9.00992 14.9905 8.00051 13.75 8.00051H6.25C5.0095 8.00051 4 9.00992 4 10.2503V16.9998H2.5V8.03276C2.5 7.80028 2.605 7.58504 2.788 7.4418L9.538 2.16C9.81025 1.94701 10.1897 1.94701 10.462 2.16L17.212 7.4418C17.395 7.58504 17.5 7.80028 17.5 8.03276V16.9998ZM7 15.4999H9.25V18.4996H7V15.4999ZM7 11.0003H9.25V14H7V11.0003ZM10.75 15.4999H13V18.4996H10.75V15.4999Z"
              fill="white"
            />
          </svg>
        }
        onAddNew={() => {
          setEditingWarehouse(null);
          setIsModalOpen(true);
        }}
        buttonText="New Warehouse"
        buttonIcon={<PlusOutlined />}
      />

      {/* Search and Filter */}
      <SearchAndFilters
        searchPlaceholder="Search by name, contact or email"
        onSearch={(text) => {
          setSearchText(text);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onFilterChange={(key, value) => {
          console.log("filter");
        }}
        onClearFilters={() => {
          console.log("clear filter");
        }}
      />

      {/* Table */}
      <Table
        bordered
        columns={columns}
        dataSource={warehouses}
        pagination={false}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        footer={() => (
          <Flex justify="space-between" align="center" gap={4}>
            <Typography.Text>
              Showing {pagination.pageSize * (pagination.page - 1) + 1} to{" "}
              {Math.min(pagination.pageSize * pagination.page, total)} of{" "}
              {total} items
            </Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={total}
              onChange={paginationChangeHandler}
            />
          </Flex>
        )}
      />

      <WarehouseModal
        open={isModalOpen}
        isEdit={!!editingWarehouse}
        initialValues={editingWarehouse ?? undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSubmit={handleSubmit}
        loading={editingWarehouse ? update.isPending : create.isPending}
      />
    </section>
  );
}
