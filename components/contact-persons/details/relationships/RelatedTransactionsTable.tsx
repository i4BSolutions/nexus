"use client";

import React, { useState } from "react";
import RelatedPurchaseOrdersTable from "./RelatedPurchaseOrdersTable";
import { Pagination, Space, Table, TableProps, Typography } from "antd";
import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import {
  RelatedTransactionItem,
  RelatedTransactionResponse,
} from "@/types/person/relationships/stock-transaction.type";

const transactionColumns: TableProps<RelatedTransactionItem>["columns"] = [
  {
    title: "DATE & TIME",
    dataIndex: "created_at",
    key: "created_at",
    render: (created_at) => {
      const dayjs = require("dayjs");
      return (
        <Space size={0} direction="vertical">
          <span style={{ fontWeight: 400 }}>
            {dayjs(created_at).format("MMM D, YYYY")}
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            {dayjs(created_at).format("h:mm:ss A")}
          </span>
        </Space>
      );
    },
  },
  {
    title: "PRODUCT",
    dataIndex: "product_name",
    key: "product_name",
    render: (product_name, record) => (
      <Space size={0} direction="vertical">
        <span>{product_name}</span>
        <span style={{ fontSize: 12, color: "#888" }}>
          {record.product_sku}
        </span>
      </Space>
    ),
  },
  {
    title: "WAREHOUSE",
    dataIndex: "warehouse_name",
    key: "warehouse_name",
    render: (warehouse_name) => (
      <Space size={8}>
        <span>{warehouse_name}</span>
      </Space>
    ),
  },
  {
    title: "DIRECTION",
    dataIndex: "direction",
    key: "direction",
    render: (direction) => (
      <Space size={8}>
        <span>{direction}</span>
      </Space>
    ),
  },
  {
    title: "QUANTITY",
    dataIndex: "quantity",
    key: "quantity",
    render: (quantity) => (
      <Space size={8}>
        <span>{quantity}</span>
      </Space>
    ),
  },
  {
    title: "REFERENCE",
    dataIndex: "reference",
    key: "reference",
    render: (reference) => (
      <Space size={8}>
        <span>{reference}</span>
      </Space>
    ),
  },
  {
    title: "EVIDENCE",
    dataIndex: "evidence_count",
    key: "evidence_count",
    render: (evidence_count) => (
      <Space size={8}>
        <span>{evidence_count}</span>
      </Space>
    ),
  },
];

const RelatedTransactionsTable: React.FC<{ id: string }> = ({ id }) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const { data, isLoading } = usePaginatedById<RelatedTransactionResponse>(
    "persons/stock-transactions",
    id,
    pagination
  );

  return (
    <div style={{ paddingTop: 12 }}>
      <Table
        loading={isLoading}
        rowKey={"id"}
        dataSource={data?.items ?? []}
        columns={transactionColumns}
        size="middle"
        style={{
          background: "#fff",
          border: "1px solid #F5F5F5",
          borderRadius: 8,
        }}
        pagination={false}
        tableLayout="auto"
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {data?.total ?? 0} items
            </Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={data?.total}
              onChange={(page, pageSize) => setPagination({ page, pageSize })}
            />
          </div>
        )}
      />
    </div>
  );
};

export default RelatedTransactionsTable;
