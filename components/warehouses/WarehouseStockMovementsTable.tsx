// components/warehouse/WarehouseStockMovementsTable.tsx
import {
  Pagination,
  Space,
  Table,
  TableProps,
  Typography,
  Tag,
  Flex,
} from "antd";
import { CalendarOutlined, TagOutlined } from "@ant-design/icons";
import SearchAndFilters from "@/components/shared/SearchAndFilters";

interface Props {
  data: any[];
  total: number;
  pagination: { page: number; pageSize: number };
  onPageChange: (pagination: { page: number; pageSize: number }) => void;
  onSearch: (text: string) => void;
}

export default function WarehouseStockMovementsTable({
  data,
  total,
  pagination,
  onPageChange,
  onSearch,
}: Props) {
  const columns: TableProps<any>["columns"] = [
    {
      title: "DATE",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: "TIME",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "PRODUCT SKU",
      dataIndex: "sku",
      key: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (sku) => (
        <Space>
          <TagOutlined />
          {sku}
        </Space>
      ),
    },
    {
      title: "PRODUCT NAME",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "DIRECTION",
      dataIndex: "direction",
      key: "direction",
      render: (dir) => (
        <Tag color={dir === "Stock In" ? "green" : "orange"}>{dir}</Tag>
      ),
    },
    {
      title: "QUANTITY",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (val) => (val != null ? val.toLocaleString() : "0"),
    },
    {
      title: "REFERENCE",
      dataIndex: "reference",
      key: "reference",
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
        onFilterChange={(key, value) => {
          console.log("filter change", key, value);
        }}
        onClearFilters={() => {
          console.log("clear filters");
        }}
      />

      <Table
        rowKey={(record) =>
          `${record.sku}-${record.date}-${record.time}-${record.direction}`
        }
        scroll={{ x: true }}
        dataSource={data}
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
