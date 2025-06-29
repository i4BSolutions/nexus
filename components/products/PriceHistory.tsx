import React from "react";
import PriceHistoryCard from "./PriceHistoryCard";
import { Empty, Spin } from "antd";
import { ProductPriceHistoryInterface } from "@/types/product/product.type";
import { useGetProductById } from "@/hooks/products/useGetProductById";

const PriceHistory = ({ id }: { id: string }) => {
  const { data, isLoading, error } = useGetProductById(
    "get-product-price-history",
    id
  );

  const priceHistory = data as ProductPriceHistoryInterface[];

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <Spin />;
      </div>
    );

  if (!priceHistory || priceHistory.length === 0)
    return (
      <Empty
        className="flex items-center justify-center"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  if (error) return <div>Error loading price history</div>;

  return (
    <>
      <PriceHistoryCard data={priceHistory} />
    </>
  );
};

export default PriceHistory;
