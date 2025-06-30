import React from "react";
import PriceHistoryCard from "./PriceHistoryCard";
import { Empty, Spin } from "antd";
import { ProductPriceHistoryInterface } from "@/types/product/product.type";

type PriceHistoryProps = {
  priceHistory: ProductPriceHistoryInterface[];
  loading: boolean;
  error: Error | null;
};

const PriceHistory = ({ priceHistory, loading, error }: PriceHistoryProps) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <Spin />
      </div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
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
    <>
      <PriceHistoryCard data={priceHistory} />
    </>
  );
};

export default PriceHistory;
