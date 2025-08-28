"use client";

import StatisticsCards from "@/components/shared/StatisticsCards";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { useList } from "@/hooks/react-query/useList";
import {
  InventoryListFilterParams,
  InventoryListInterface,
  InventoryResponse,
} from "@/types/inventory/inventory.type";
import { WarehouseResponse } from "@/types/warehouse/warehouse.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
import { DollarCircleOutlined, TagOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Select,
  Table,
  TableProps,
  Typography,
} from "antd";
import { SearchProps } from "antd/es/input";
import { useMemo, useState } from "react";

const Inventory = () => {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState("");
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    data: inventoryListData,
    isLoading: inventoryListLoading,
    error: inventoryListError,
  } = useGetWithParams<InventoryResponse, InventoryListFilterParams>(
    "inventory",
    {
      q: searchText,
      page: pagination.page,
      pageSize: pagination.pageSize,
      warehouse: warehouseId,
    }
  );

  const {
    data: warehousesData,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useList<WarehouseResponse>("warehouses");

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statusChangeHandler = (value: string) => {
    setWarehouseId(value === "All Warehouses" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFiltersHandler = () => {
    setWarehouseId(undefined);
    setSearchText("");
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  const columns = useMemo<TableProps<InventoryListInterface>["columns"]>(
    () => [
      {
        title: "PRODUCT SKU",
        dataIndex: "sku",
        key: "sku",
        sorter: (a, b) => a.sku.localeCompare(b.sku),
        sortDirections: ["ascend", "descend"],
        render: (text) => <Typography.Text>{text}</Typography.Text>,
      },
      {
        title: "NAME",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
        render: (text) => <Typography.Text>{text}</Typography.Text>,
      },
      {
        title: "WAREHOUSE",
        dataIndex: "warehouse",
        key: "warehouse",
        render: (text) => <Typography.Text>{text}</Typography.Text>,
      },
      {
        title: "IN-STOCK UNITS",
        dataIndex: "current_stock",
        key: "current_stock",
        render: (value) => <Typography.Text>{value}</Typography.Text>,
      },
      {
        title: "UNIT PRICE",
        dataIndex: "unit_price",
        key: "unit_price",
        render: (value) => (
          <Typography.Text>
            {typeof value === "number"
              ? `${formatWithThousandSeparator(value)} USD`
              : "-"}
          </Typography.Text>
        ),
      },
      {
        title: "TOTAL VALUE",
        dataIndex: "total_value",
        key: "total_value",
        render: (value) => (
          <Typography.Text>
            {typeof value === "number"
              ? `${formatWithThousandSeparator(value)} USD`
              : "-"}
          </Typography.Text>
        ),
      },
    ],
    []
  );

  if (inventoryListError || warehouseError) {
    message.error(inventoryListError?.message || warehouseError?.message);
    return <Empty description="Server Error." />;
  }

  return (
    <>
      <StatisticsCards
        stats={[
          {
            title: "Total Items",
            value: inventoryListData?.total_item_count ?? 0,
            tooltip: "Total Items",
            icon: <TagOutlined />,
            bgColor: "#36CFC9",
            gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFFFFF 100%)",
            borderColor: "#87E8DE",
            total_approved: 0,
          },
          {
            title: "Total Inventory Value (USD)",
            value: inventoryListData?.total_inventory_value ?? 0,
            tooltip: "Total Inventory Value (USD)",
            icon: <DollarCircleOutlined />,
            bgColor: "#73D13D",
            gradient: "linear-gradient(90deg, #F6FFED 0%, #FFFFFF 100%)",
            borderColor: "#B7EB8F",
            total_approved: 0,
            prefix: "$",
          },
        ]}
      />
      <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
        <Input.Search
          placeholder="Search By Product SKU or Name"
          allowClear
          onSearch={onSearchHandler}
          style={{ maxWidth: 420 }}
        />
        <Flex justify="center" align="center" gap={12}>
          <span>Filter(s):</span>

          <Select
            loading={warehouseLoading}
            value={warehouseId ?? "All Warehouses"}
            onChange={statusChangeHandler}
            options={[
              { value: "All Warehouses", label: "All Warehouses" },
              ...(warehousesData?.items.map((w) => ({
                value: w.id,
                label: w.name,
              })) || []),
            ]}
          />
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={clearFiltersHandler}
          >
            Clear Filter(s)
          </Button>
        </Flex>
      </Flex>

      <Table
        columns={columns}
        loading={inventoryListLoading}
        dataSource={inventoryListData?.items}
        pagination={false}
        rowKey="id"
        scroll={{ x: true }}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        footer={() => (
          <Flex justify="space-between" align="center" gap={4}>
            <Typography.Text>
              Total {inventoryListData?.total} items
            </Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={inventoryListData?.total}
              onChange={paginationChangeHandler}
            />
          </Flex>
        )}
      />
    </>
  );
};

export default Inventory;
