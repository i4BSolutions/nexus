"use client";

import StatisticsCards from "@/components/shared/StatisticsCards";
import { DollarCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Input,
  Select,
  Table,
  TableProps,
  Typography,
} from "antd";
import { SearchProps } from "antd/es/input";
import React, { useState } from "react";

type TableColumns = {
  product_sku: string;
  product_name: string;
  warehouse: string;
  in_stock_unit: number;
  unit_price: number;
  total_value: number;
};

const table_data: TableColumns[] = [
  {
    product_sku: "PRD-001",
    product_name: "Wireless Mouse",
    warehouse: "Warehouse A",
    in_stock_unit: 150,
    unit_price: 25.5,
    total_value: 3825,
  },
  {
    product_sku: "PRD-002",
    product_name: "Mechanical Keyboard",
    warehouse: "Warehouse B",
    in_stock_unit: 80,
    unit_price: 75.0,
    total_value: 6000,
  },
  {
    product_sku: "PRD-003",
    product_name: "USB-C Cable",
    warehouse: "Warehouse A",
    in_stock_unit: 500,
    unit_price: 5.0,
    total_value: 2500,
  },
  {
    product_sku: "PRD-004",
    product_name: "Laptop Stand",
    warehouse: "Warehouse C",
    in_stock_unit: 60,
    unit_price: 42.99,
    total_value: 2579.4,
  },
  {
    product_sku: "PRD-005",
    product_name: "External SSD 1TB",
    warehouse: "Warehouse B",
    in_stock_unit: 35,
    unit_price: 120.0,
    total_value: 4200,
  },
];

const Inventory = () => {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
    // setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statusChangeHandler = (value: string) => {
    setStatus(value === "All Warehouses" ? undefined : value);
    // setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFiltersHandler = () => {
    setStatus(undefined);
    setSearchText("");
  };

  const columns: TableProps<TableColumns>["columns"] = [
    {
      title: "PRODUCT SKU",
      dataIndex: "product_sku",
      key: "product_sku",
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: "NAME",
      dataIndex: "product_name",
      key: "product_name",
      render: (name) => <Typography.Text>{name}</Typography.Text>,
    },
    {
      title: "WAREHOUSE",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (warehouse) => <Typography.Text>{warehouse}</Typography.Text>,
    },
    {
      title: "IN-STOCK UNITS",
      dataIndex: "in_stock_unit",
      key: "in_stock_unit",
      render: (in_stock_unit) => (
        <Typography.Text>{in_stock_unit}</Typography.Text>
      ),
    },
    {
      title: "UNIT PRICE",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (unit_price) => <Typography.Text>{unit_price}</Typography.Text>,
    },
    {
      title: "TOTAL VALUE",
      dataIndex: "total_value",
      key: "total_value",
      render: (total_value) => <Typography.Text>{total_value}</Typography.Text>,
    },
  ];

  return (
    <>
      <StatisticsCards
        stats={[
          {
            title: "Total Items",
            value: "",
            tooltip: "Total Items",
            icon: <DollarCircleOutlined />,
            bgColor: "#36CFC9",
            gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFFFFF 100%)",
            borderColor: "#87E8DE",
            total_approved: 0,
            prefix: "$",
          },
          {
            title: "Total Inventory Value (USD)",
            value: "",
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
          placeholder="Search By Allocated Number"
          allowClear
          onSearch={onSearchHandler}
          style={{ maxWidth: 420 }}
        />
        <Flex justify="center" align="center" gap={12}>
          <span>Filter(s):</span>

          <Select
            defaultValue="All Warehouses"
            style={{ width: 160 }}
            onChange={statusChangeHandler}
            options={[
              {
                value: "All Warehouses",
                label: "All Warehouses",
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
      </Flex>

      <Table
        columns={columns}
        dataSource={table_data}
        pagination={false}
        rowKey="id"
        scroll={{ x: true }}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        // footer={() => (
        //   <Flex justify="space-between" align="center" gap={4}>
        //     <Typography.Text>
        //       Showing {pagination.pageSize * (pagination.page - 1) + 1} to{" "}
        //       {Math.min(pagination.pageSize * pagination.page, total)} of{" "}
        //       {total} items
        //     </Typography.Text>
        //     <Pagination
        //       current={pagination.page}
        //       pageSize={pagination.pageSize}
        //       total={total}
        //       onChange={paginationChangeHandler}
        //     />
        //   </Flex>
        // )}
      />
    </>
  );
};

export default Inventory;
