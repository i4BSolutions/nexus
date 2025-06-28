"use client";

import { Card, Progress, Typography, Space } from "antd";
import { ShopOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface CurrentStockCardProps {
  stock: number;
  minStock: number;
}

export default function CurrentStockCard({
  stock,
  minStock,
}: CurrentStockCardProps) {
  const percentage = minStock > 0 ? Math.round((stock / minStock) * 100) : 0;

  // Determine color
  let color = "#52C41A"; // Green
  if (percentage === 0) color = "#F5222D"; // Red
  else if (percentage < 100) color = "#FA8C16"; // Orange

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: "100%",
        width: 564,
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderWidth: 1,
        borderColor: "#F9F0FF",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #E5E7EB",
          background: "linear-gradient(to right, #f5f3ff, #fff)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Space direction="horizontal" align="center">
          <div
            style={{
              backgroundColor: "#9333EA",
              color: "white",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            <ShopOutlined />
          </div>
          <div>
            <Title level={5} style={{ marginBottom: 0 }}>
              Current Stock
            </Title>
            <Text type="secondary">Current stock levels</Text>
          </div>
        </Space>
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        <Text type="secondary">Quantity In Stock</Text>
        <Title level={1} style={{ margin: "4px 0" }}>
          {stock}
        </Title>

        <Progress
          percent={Math.min(percentage, 100)}
          strokeColor={color}
          showInfo={false}
          style={{ marginTop: 12 }}
        />

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>
            Minimum Stock: <strong>{minStock}</strong>
          </Text>
          <Text style={{ color, fontWeight: 500 }}>
            {percentage}% of minimum
          </Text>
        </div>
      </div>
    </Card>
  );
}
