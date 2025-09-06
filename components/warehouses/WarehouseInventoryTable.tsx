// components/warehouse/WarehouseInventoryTable.tsx
import {
  Pagination,
  Space,
  Table,
  TableProps,
  Typography,
  Tag,
  Flex,
} from "antd";
import { TagOutlined } from "@ant-design/icons";
import SearchAndFilters from "@/components/shared/SearchAndFilters";

import { useList } from "@/hooks/react-query/useList";
import { ProductInterface } from "@/types/product/product.type";
import { useState } from "react";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";

interface Props {
  data: any[];
  total: number;
  pagination: { page: number; pageSize: number };
  onPageChange: (pagination: { page: number; pageSize: number }) => void;
  onSearch: (text: string) => void;
}

export default function WarehouseInventoryTable({
  data,
  total,
  pagination,
  onPageChange,
  onSearch,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>();

  interface ProductsListResponse {
    items: ProductInterface[];
    [key: string]: any;
  }

  const { data: productsDataRaw, isLoading: productsLoading } =
    useList<ProductsListResponse>("products", {
      pageSize: "all" as any,
      status: "true",
    });

  const productsData = productsDataRaw?.items ?? [];

  const categoryOptions = Array.from(
    new Set(productsData?.map((p) => p.category))
  )
    .filter(Boolean)
    .map((category) => ({
      label: category,
      value: category,
    }));

  const filters = [
    {
      key: "category",
      label: "Category",
      value: categoryFilter,
      options: [{ label: "All Categories", value: "" }, ...categoryOptions],
    },
  ];

  const filteredData = categoryFilter
    ? data.filter((item) => item.category === categoryFilter)
    : data;

  const columns: TableProps<any>["columns"] = [
    {
      title: "PRODUCT SKU",
      dataIndex: "sku",
      key: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (text) => (
        <Space>
          <TagOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "CURRENT STOCK",
      dataIndex: "current_stock",
      key: "current_stock",
      align: "right",
      render: (val) => (val != null ? formatWithThousandSeparator(val) : "0"),
    },
    {
      title: "INCOMING",
      dataIndex: "incoming",
      key: "incoming",
      align: "right",
      render: (val) => (val != null ? formatWithThousandSeparator(val) : "0"),
    },
    {
      title: "OUTGOING",
      dataIndex: "outgoing",
      key: "outgoing",
      align: "right",
      render: (val) => (val != null ? formatWithThousandSeparator(val) : "0"),
    },
    {
      title: "TOTAL VALUE",
      dataIndex: "total_value",
      key: "total_value",
      align: "right",
      render: (val) =>
        val != null ? `${formatWithThousandSeparator(val)} USD` : "0 USD",
    },
  ];

  return (
    <>
      <SearchAndFilters
        searchPlaceholder="Search by name, contact or email"
        onSearch={(text) => {
          onSearch(text);
          onPageChange({ ...pagination, page: 1 });
        }}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "category") {
            setCategoryFilter(value);
            onPageChange({ ...pagination, page: 1 });
          }
        }}
        onClearFilters={() => {
          setCategoryFilter("");
        }}
      />

      <Table
        rowKey="id"
        scroll={{ x: true }}
        dataSource={filteredData}
        columns={columns}
        pagination={false}
        footer={() => (
          <Flex justify="space-between" align="center">
            <Typography.Text>
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(total, pagination.page * pagination.pageSize)} of{" "}
              {total}
            </Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={total}
              onChange={(page, pageSize) => onPageChange({ page, pageSize })}
            />
          </Flex>
        )}
      />
    </>
  );
}
