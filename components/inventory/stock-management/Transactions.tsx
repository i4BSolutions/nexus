"use client";

import {
  CalendarOutlined,
  DownCircleOutlined,
  TagOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  DatePicker,
  Flex,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useState } from "react";

const { RangePicker } = DatePicker;

interface StockMovement {
  key: string;
  date: string;
  time: string;
  sku: string;
  product: string;
  warehouse: string;
  direction: "Stock In" | "Stock Out";
  quantity: string;
  reference: string;
  note: string;
}

const data: StockMovement[] = [
  {
    key: "1",
    date: "Jun 28, 2025",
    time: "3:18:52 PM",
    sku: "AA - 00001",
    product: "iPhone 16",
    warehouse: "Warehouse A",
    direction: "Stock In",
    quantity: "5,789",
    reference: "Warehouse Transfer",
    note: "–",
  },
  {
    key: "2",
    date: "May 19, 2025",
    time: "3:19:10 PM",
    sku: "AA - 00002",
    product: "iPhone 16 Pro",
    warehouse: "Warehouse B",
    direction: "Stock In",
    quantity: "3,987",
    reference: "Warehouse Transfer",
    note: "–",
  },
  {
    key: "3",
    date: "Apr 22, 2025",
    time: "3:19:32 PM",
    sku: "AA - 00003",
    product: "iPhone 16 Pro Max",
    warehouse: "Warehouse C",
    direction: "Stock Out",
    quantity: "6,234",
    reference: "Production Consumption",
    note: "–",
  },
  {
    key: "4",
    date: "Mar 30, 2025",
    time: "3:19:54 PM",
    sku: "AA - 00004",
    product: "iPad",
    warehouse: "Warehouse D",
    direction: "Stock In",
    quantity: "7,123",
    reference: "INV-2025-1239-41",
    note: "–",
  },
  {
    key: "5",
    date: "Feb 15, 2025",
    time: "3:20:15 PM",
    sku: "AA - 00005",
    product: "iPad Pro",
    warehouse: "Warehouse E",
    direction: "Stock Out",
    quantity: "4,567",
    reference: "Warehouse Transfer",
    note: "–",
  },
  {
    key: "6",
    date: "Jan 10, 2025",
    time: "3:20:37 PM",
    sku: "AA - 00006",
    product: "iPad Air",
    warehouse: "Warehouse F",
    direction: "Stock Out",
    quantity: "3,456",
    reference: "Warehouse Transfer",
    note: "–",
  },
  {
    key: "7",
    date: "Jun 3, 2025",
    time: "3:20:58 PM",
    sku: "AA - 00007",
    product: "MacBook Pro",
    warehouse: "Warehouse G",
    direction: "Stock In",
    quantity: "6,789",
    reference: "INV-2025-1239-18",
    note: "–",
  },
  {
    key: "8",
    date: "May 5, 2025",
    time: "3:21:20 PM",
    sku: "AA - 00008",
    product: "MacBook Air",
    warehouse: "Warehouse H",
    direction: "Stock In",
    quantity: "4,123",
    reference: "INV-2025-1239-76",
    note: "–",
  },
  {
    key: "9",
    date: "Apr 12, 2025",
    time: "3:21:42 PM",
    sku: "AA - 00009",
    product: "iMac",
    warehouse: "Warehouse I",
    direction: "Stock Out",
    quantity: "7,890",
    reference: "Other",
    note: "–",
  },
  {
    key: "10",
    date: "Mar 25, 2025",
    time: "3:22:05 PM",
    sku: "AA - 00010",
    product: "Mac Studio",
    warehouse: "Warehouse J",
    direction: "Stock In",
    quantity: "5,345",
    reference: "INV-2025-1239-07",
    note: "–",
  },
];

const Transactions = () => {
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const statusChangeHandler = (value: string) => {
    setStatus(value === "All Warehouses" ? undefined : value);
    // setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFiltersHandler = () => {
    setStatus(undefined);
    setDateRange(null);
  };

  const columns: ColumnsType<StockMovement> = [
    {
      title: "DATE & TIME",
      key: "date",
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
      render: (sku) => (
        <>
          <TagOutlined style={{ marginRight: 8 }} />
          {sku}
        </>
      ),
    },
    {
      title: "PRODUCT NAME",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "WAREHOUSE",
      dataIndex: "warehouse",
      key: "warehouse",
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
    },
    {
      title: "REFERENCE",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "NOTE",
      dataIndex: "note",
      key: "note",
    },
  ];

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
          defaultValue="All Products"
          style={{ width: 130 }}
          onChange={statusChangeHandler}
          options={[
            {
              value: "All Products",
              label: "All Products",
            },
          ]}
        />

        <Select
          defaultValue="All Warehouses"
          style={{ width: 130 }}
          onChange={statusChangeHandler}
          options={[
            {
              value: "All Warehouses",
              label: "All Warehouses",
            },
          ]}
        />

        <Select
          defaultValue="All Directions"
          style={{ width: 130 }}
          onChange={statusChangeHandler}
          options={[
            {
              value: "All Directions",
              label: "All Directions",
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
          dataSource={data}
          pagination={false}
          bordered
        />
      </Space>
    </>
  );
};

export default Transactions;
