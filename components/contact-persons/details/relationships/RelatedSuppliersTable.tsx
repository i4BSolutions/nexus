"use client";

import React, { useState } from "react";
import { Pagination, Space, Table, TableProps, Tag, Typography } from "antd";

import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import {
  RelatedSupplierItem,
  RelatedSupplierResponse,
} from "@/types/person/relationships/supplier.type";

const supplierColumns: TableProps<RelatedSupplierItem>["columns"] = [
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
    title: "EMAIL",
    dataIndex: "email",
    key: "email",
    render: (email) => (
      <Space size={8}>
        <span>{email}</span>
      </Space>
    ),
  },
  {
    title: "PHONE",
    dataIndex: "phone",
    key: "phone",
    render: (phone) => (
      <Space size={8}>
        <span>{phone ?? "N/A"}</span>
      </Space>
    ),
  },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (_, record) =>
      record.status ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
  },
];

const RelatedSuppliersTable: React.FC<{ id: string }> = ({ id }) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const { data, isLoading } = usePaginatedById<RelatedSupplierResponse>(
    "persons/suppliers",
    id,
    pagination
  );

  return (
    <div style={{ paddingTop: 12 }}>
      <Table
        loading={isLoading}
        rowKey={"id"}
        dataSource={data?.items ?? []}
        columns={supplierColumns}
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

export default RelatedSuppliersTable;
