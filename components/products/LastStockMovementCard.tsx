"use client";

import { LastStockMovement } from "@/types/product/product.type";
import { EyeOutlined, SwapOutlined } from "@ant-design/icons";
import { Card, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text, Title, Link } = Typography;

interface LastStockMovementCardProps {
  data: LastStockMovement | null;
  onViewAll?: () => void;
}

export default function LastStockMovementCard({
  data,
  onViewAll,
}: LastStockMovementCardProps) {
  const isIn = data?.type === "IN";
  const quantityDisplay = `${isIn ? "+" : "-"}${data?.quantity} Units`;

  return (
    <Card
      variant="borderless"
      style={{
        maxWidth: "100%",
        width: 564,
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #E5E7EB",
          background: "linear-gradient(to right, #f5f3ff, #fff)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
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
            <SwapOutlined />
          </div>
          <div>
            <Title level={5} style={{ marginBottom: 0 }}>
              Last Stock Movement
            </Title>
            <Text type="secondary">Most recent inventory update</Text>
          </div>
        </Space>
        {onViewAll && (
          <Link onClick={onViewAll} style={{ alignSelf: "center" }}>
            <EyeOutlined /> View All Movements
          </Link>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 16 }}>
              {dayjs(data?.date).format("MMM D, YYYY h:mm A")}
            </Text>
            <Tag
              color={isIn ? "cyan" : "volcano"}
              style={{
                marginLeft: 8,
                borderRadius: 8,
                fontSize: 12,
                padding: "2px 8px",
              }}
            >
              {isIn ? "Stock In" : "Stock Out"}
            </Tag>
          </div>
          <Title level={5} style={{ margin: 0 }}>
            {quantityDisplay}
          </Title>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary">Invoice</Text>
          <br />
          <Link style={{ fontSize: 16 }}>{data?.invoice_id}</Link>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary">Warehouse</Text>
          <br />
          <Text strong>{data?.warehouse_name}</Text>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary">Processed by</Text>
          <br />
          <Text strong>{data?.processed_by}</Text>
        </div>
      </div>
    </Card>
  );
}
