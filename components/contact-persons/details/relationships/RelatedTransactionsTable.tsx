"use client";

import React, { useState } from "react";
import RelatedPurchaseOrdersTable from "./RelatedPurchaseOrdersTable";
import { Pagination, Space, Table, TableProps, Tag, Typography } from "antd";
import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import {
  RelatedTransactionItem,
  RelatedTransactionResponse,
} from "@/types/person/relationships/stock-transaction.type";
import ImageViewerModal from "@/components/shared/ImageViewerModal";
import { DownCircleOutlined, UpCircleOutlined } from "@ant-design/icons";

const RelatedTransactionsTable: React.FC<{ id: string }> = ({ id }) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<
    { src: string; name: string }[]
  >([]);
  const [viewerStart, setViewerStart] = useState(0);

  const openViewer = (images: any[], startIndex = 0) => {
    setViewerImages(images.map((img) => ({ src: img.url, name: img.name })));
    setViewerStart(startIndex);
    setViewerOpen(true);
  };

  const { data, isLoading } = usePaginatedById<RelatedTransactionResponse>(
    "persons/stock-transactions",
    id,
    pagination
  );

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
          <Tag
            style={{ borderRadius: 10, display: "flex", gap: 4 }}
            color={direction === "IN" ? "#52C41A" : "#FAAD14"}
          >
            {direction === "IN" ? <DownCircleOutlined /> : <UpCircleOutlined />}
            {direction === "IN" ? "STOCK IN" : "STOCK OUT"}
          </Tag>
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
      title: "Evidence",
      dataIndex: "evidence",
      key: "evidence",
      render: (evidence: any[]) => {
        if (!evidence || evidence.length === 0) {
          return <Typography.Text>-</Typography.Text>;
        }

        const imageEvidence = evidence.filter((e) =>
          e.mime?.startsWith("image/")
        );
        const first = imageEvidence[0];
        const count = imageEvidence.length;

        if (!first) {
          return (
            <a
              href={evidence[0].url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#1677ff" }}
            >
              {evidence[0].name || "File"}
            </a>
          );
        }

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => openViewer(imageEvidence, 0)}
          >
            <img
              src={first.url}
              alt={first.name}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />

            {count > 1 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,.45)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                +{count - 1}
              </div>
            )}
          </div>
        );
      },
    },
  ];

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

      {viewerOpen && (
        <ImageViewerModal
          open={viewerOpen}
          images={viewerImages}
          start={viewerStart}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default RelatedTransactionsTable;
