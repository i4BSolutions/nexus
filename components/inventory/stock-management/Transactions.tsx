"use client";

import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { useList } from "@/hooks/react-query/useList";
import { ProductResponse } from "@/types/product/product.type";
import {
  StockTransactionFilterParams,
  StockTransactionInterface,
  StockTransactionInterfaceResponse,
} from "@/types/stock/stock.type";
import { WarehouseResponse } from "@/types/warehouse/warehouse.type";
import {
  CalendarOutlined,
  DownCircleOutlined,
  TagOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  DatePicker,
  Empty,
  Flex,
  Pagination,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";

const { RangePicker } = DatePicker;

const Transactions = () => {
  const { message } = App.useApp();

  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<
    "All Directions" | "Stock In" | "Stock Out" | undefined
  >("All Directions");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    data: stockTransactionsData,
    isLoading: stockTransactionsLoading,
    error: stockTransactionsError,
  } = useGetWithParams<
    StockTransactionInterfaceResponse,
    StockTransactionFilterParams
  >("stock-transactions", {
    start_date: dateRange?.[0]?.startOf("day").toISOString(),
    end_date: dateRange?.[1]?.endOf("day").toISOString(),
    direction: direction,
    warehouse: warehouseId,
    product: productId,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  console.log(stockTransactionsData);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useList<ProductResponse>("products", {
    pageSize: "all" as any,
    status: "true",
  });

  const {
    data: warehousesData,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useList<WarehouseResponse>("warehouses");

  const productsFilterHandler = (value: string) => {
    setProductId(value === "All Products" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const warehouseFilterHandler = (value: string) => {
    setWarehouseId(value === "All Warehouses" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const directionFilterHandler = (
    value: "All Directions" | "Stock In" | "Stock Out"
  ) => {
    setDirection(value === "All Directions" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFiltersHandler = () => {
    setWarehouseId(undefined);
    setProductId(undefined);
    setDirection(undefined);
    setDateRange(null);
    setPagination({ page: 1, pageSize: 10 });
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  const columns: ColumnsType<StockTransactionInterface> = useMemo(
    () => [
      {
        title: "DATE & TIME",
        key: "date_and_time",
        dataIndex: "date",
        render: (_, record) => (
          <>
            <Typography.Text>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {record.date}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary">{record.time}</Typography.Text>
          </>
        ),
      },
      {
        title: "PRODUCT SKU",
        dataIndex: "sku",
        key: "sku",
        sorter: (a, b) => a.sku.localeCompare(b.sku),
        sortDirections: ["ascend", "descend"],
        render: (sku) => (
          <>
            <TagOutlined style={{ marginRight: 8 }} />
            {sku}
          </>
        ),
      },
      {
        title: "PRODUCT NAME",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
        render: (name) => <Typography.Text>{name}</Typography.Text>,
      },
      {
        title: "WAREHOUSE",
        dataIndex: "warehouse",
        key: "warehouse",
        render: (warehouse) => <Typography.Text>{warehouse}</Typography.Text>,
      },
      {
        title: "DIRECTION",
        dataIndex: "direction",
        key: "direction",
        render: (direction) => (
          <Tag
            style={{ borderRadius: 10, display: "flex", gap: 4 }}
            color={direction === "Stock In" ? "#52C41A" : "#FAAD14"}
          >
            {direction === "Stock In" ? (
              <DownCircleOutlined />
            ) : (
              <UpCircleOutlined />
            )}
            {direction}
          </Tag>
        ),
      },
      {
        title: "QUANTITY",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity) => <Typography.Text>{quantity}</Typography.Text>,
      },
      {
        title: "REFERENCE",
        dataIndex: "reference",
        key: "reference",
        render: (reference) => <Typography.Text>{reference}</Typography.Text>,
      },
      {
        title: "NOTE",
        dataIndex: "note",
        key: "note",
        render: (note) => <Typography.Text>{note}</Typography.Text>,
      },
    ],
    []
  );

  if (stockTransactionsError || productsError || warehouseError) {
    message.error(
      stockTransactionsError?.message ||
        productsError?.message ||
        warehouseError?.message
    );
    return <Empty description="Server Error." />;
  }

  return (
    <>
      <Flex align="center" gap={8}>
        <span>Filter(s):</span>
        <RangePicker
          onChange={(dates) => setDateRange(dates)}
          allowClear
          style={{ minWidth: 260 }}
          value={dateRange}
        />

        <Select
          loading={productsLoading}
          value={productId ?? "All Products"}
          style={{ width: 130 }}
          onChange={productsFilterHandler}
          options={[
            { value: "All Products", label: "All Products" },
            ...(productsData?.items.map((w) => ({
              value: w.id,
              label: w.name,
            })) || []),
          ]}
        />

        <Select
          loading={warehouseLoading}
          value={warehouseId ?? "All Warehouses"}
          onChange={warehouseFilterHandler}
          options={[
            { value: "All Warehouses", label: "All Warehouses" },
            ...(warehousesData?.items.map((w) => ({
              value: w.id,
              label: w.name,
            })) || []),
          ]}
        />

        <Select
          value={direction ?? "All Directions"}
          style={{ width: 130 }}
          onChange={directionFilterHandler}
          options={[
            {
              value: "All Directions",
              label: "All Directions",
            },
            {
              value: "Stock In",
              label: "Stock In",
            },
            {
              value: "Stock Out",
              label: "Stock Out",
            },
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
      <Space style={{ width: "100%" }}>
        <Table
          columns={columns}
          loading={stockTransactionsLoading}
          dataSource={stockTransactionsData?.items}
          pagination={false}
          bordered
          rowKey="id"
          scroll={{ x: true }}
          style={{
            border: "2px solid #F5F5F5",
            borderRadius: "8px",
            width: "100%",
          }}
          footer={() => (
            <Flex justify="space-between" align="center" gap={4}>
              <Typography.Text>
                Total {stockTransactionsData?.total} items
              </Typography.Text>
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={stockTransactionsData?.total}
                onChange={paginationChangeHandler}
              />
            </Flex>
          )}
        />
      </Space>
    </>
  );
};

export default Transactions;
