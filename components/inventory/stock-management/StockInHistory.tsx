import { StockTransactionHistory } from "@/types/stock/stock.type";
import { Button, Card, Flex, Spin, Typography } from "antd";
import React from "react";

interface StockInHistoryInterface {
  items: StockTransactionHistory[] | undefined;
  isLoading?: boolean;
}

const StockInHistory = ({ items, isLoading }: StockInHistoryInterface) => {
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-100vh">
        <Spin />
      </div>
    );

  return (
    <Card
      variant="outlined"
      styles={{
        body: {
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}
      title={
        <Flex
          style={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text
            style={{ color: "#00000073", fontSize: 16, fontWeight: 500 }}
          >
            Recent Stock In
          </Typography.Text>
          <Button type="link" style={{ fontSize: 12, fontWeight: 400 }}>
            View All Stock In History
          </Button>
        </Flex>
      }
    >
      {items?.map((item, index) => (
        <div
          key={index}
          style={{
            padding: "12px 24px",
            borderBottom:
              index !== items.length - 1 ? "1px solid #f0f0f0" : "none",
          }}
        >
          <Flex
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              // marginBottom: 4,
            }}
          >
            <Typography.Text
              style={{ color: "#000000D9", fontSize: 16, fontWeight: 500 }}
            >
              {item.product_name}
            </Typography.Text>
            <Typography.Text
              style={{ color: "#52C41A", fontSize: 16, fontWeight: 500 }}
            >
              {item.quantity}
            </Typography.Text>
          </Flex>

          <Flex
            style={{
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <Typography.Text
              style={{ color: "#00000073", fontSize: 14, fontWeight: 400 }}
            >
              {item.product_sku}
            </Typography.Text>
            <Typography.Text
              style={{ color: "#00000073", fontSize: 14, fontWeight: 400 }}
            >
              {item.warehouse}
            </Typography.Text>
          </Flex>

          <Flex style={{ justifyContent: "space-between" }}>
            <Typography.Text
              style={{ color: "#00000073", fontSize: 14, fontWeight: 400 }}
            >
              {item.invoice_number}
            </Typography.Text>
            <Typography.Text
              style={{ color: "#00000073", fontSize: 14, fontWeight: 400 }}
            >
              {item.date}
            </Typography.Text>
          </Flex>
        </div>
      ))}
    </Card>
  );
};

export default StockInHistory;
