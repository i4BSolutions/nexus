import React from "react";
import PriceHistoryCard from "./PriceHistoryCard";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";

const PriceHistory = ({ id }: { id: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["price_history"],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/${id}/get-product-price-history`
      );
      return await response.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Spin />;
      </div>
    );
  if (error) return <div>Error loading price history</div>;

  return (
    <>
      <PriceHistoryCard data={data?.data} />
    </>
  );
};

export default PriceHistory;
