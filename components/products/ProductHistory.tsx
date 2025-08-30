import React from "react";
import PriceHistoryCard from "./PriceHistoryCard";
import { Empty, Pagination, Space, Spin, Typography } from "antd";
import { ProductHistoryPaginatedResponse } from "@/types/product/product.type";

type PriceHistoryProps = {
  data: ProductHistoryPaginatedResponse | undefined;
  loading: boolean;
  error: Error | null;
  pagination: { page: number; pageSize: number };
  onPaginationChange: (page: number, pageSize: number) => void;
};

const ProductHistory = ({
  data,
  loading,
  error,
  pagination,
  onPaginationChange,
}: PriceHistoryProps) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <Spin />
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="text-center py-20">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20">Something went wrong!</div>;
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <PriceHistoryCard data={data} />
      <div className="flex justify-between">
        <Typography.Text type="secondary">
          Total {data.pagination.totalPages} items
        </Typography.Text>
        <Pagination
          current={pagination.page || 1}
          pageSize={pagination.pageSize || 10}
          total={data.pagination.totalPages || 0}
          onChange={onPaginationChange}
        />
      </div>
    </Space>
  );
};

export default ProductHistory;
