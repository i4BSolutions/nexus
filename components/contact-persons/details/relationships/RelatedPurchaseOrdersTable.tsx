"use client";

import React, { useState } from "react";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import { Pagination, Space, Table, TableProps, Typography } from "antd";

import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import {
  RelatedPOItem,
  RelatedPOResponse,
} from "@/types/person/relationships/purchase-order.type";
import StatusBadge from "@/components/purchase-orders/StatusBadge";

const poColumns: TableProps<RelatedPOItem>["columns"] = [
  {
    title: "PURCHASE ORDER",
    dataIndex: "purchase_order_no",
    key: "purchase_order_no",
    render: (purchase_order_no, record) => (
      <Space size={8}>
        <a style={{ color: "#1677ff", fontWeight: 500 }}>{purchase_order_no}</a>
        {record.approval_status === "Draft" ? (
          <HourglassOutlined />
        ) : record.approval_status === "Approved" ? (
          <CheckCircleOutlined style={{ color: "#52C41A" }} />
        ) : null}
      </Space>
    ),
  },
  {
    title: "SUPPLIER NAME",
    dataIndex: "supplier_name",
    key: "supplier_name",
    render: (supplier_name) => (
      <Space size={8}>
        <span>{supplier_name}</span>
      </Space>
    ),
  },
  {
    title: (
      <Space size={6} align="center">
        <span>ORDER DATE</span>
      </Space>
    ),
    dataIndex: "order_date",
    key: "order_date",
    sorter: (a, b) =>
      new Date(a.order_date).getTime() - new Date(b.order_date).getTime(),
    render: (order_date) => (
      <Space size={6}>
        <CalendarOutlined style={{ fontSize: 14 }} />
        <span>{order_date}</span>
      </Space>
    ),
  },
  {
    title: "EXPECTED DELIVERY",
    dataIndex: "expected_delivery_date",
    key: "expected_delivery_date",
    render: (expected_delivery_date) => (
      <Space size={6}>
        <CalendarOutlined style={{ fontSize: 14 }} />
        <span>{expected_delivery_date}</span>
      </Space>
    ),
  },
  {
    title: "AMOUNT",
    dataIndex: "amount",
    key: "amount",
    align: "right" as const,
    render: (_, record) => {
      const local = Number(record.amount_local);
      const usd = Number(record.amount_usd);
      return (
        <div style={{ textAlign: "left" }}>
          <Typography.Text strong>
            {local.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}{" "}
            {record.currency_code}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            (
            {usd.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            )
          </Typography.Text>
        </div>
      );
    },
  },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (status) => <StatusBadge status={status} />,
  },
];

const RelatedPurchaseOrdersTable: React.FC<{ id: string }> = ({ id }) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const { data, isLoading } = usePaginatedById<RelatedPOResponse>(
    "persons/purchase-orders",
    id,
    pagination
  );

  return (
    <div style={{ paddingTop: 12 }}>
      <Table
        loading={isLoading}
        rowKey={"id"}
        dataSource={data?.items ?? []}
        columns={poColumns}
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

export default RelatedPurchaseOrdersTable;
