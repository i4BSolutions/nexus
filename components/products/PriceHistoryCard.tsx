"use client";

import React from "react";
import { Card, Avatar, Typography, Space, Divider, Input } from "antd";
import {
  DollarCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ProductPriceHistoryInterface } from "@/types/product/product.type";

const { Title, Text, Paragraph } = Typography;

const PriceHistoryCard = ({
  data,
}: {
  data: ProductPriceHistoryInterface[];
}) => {
  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 1140,
        borderRadius: 12,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(to right, #f9f5ff, #fff)",
          borderBottom: "1px solid #e9d7fe",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space align="start">
          <div
            style={{
              backgroundColor: "#9333EA",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 18,
            }}
          >
            <DollarCircleFilled />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Price History
            </Title>
            <Text type="secondary">
              Last updated on{" "}
              {dayjs(data[0]?.created_at).format("MMM D, YYYY h:mm A")}
            </Text>
          </div>
        </Space>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 24px" }}>
        {data.map((change, idx) => (
          <div key={change.id} style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <Space align="start">
                <div
                  style={{
                    backgroundColor: "#FAAD14",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                  }}
                >
                  <ExclamationCircleOutlined />
                </div>
                <div>
                  <Text strong>Price Updated</Text>
                  <Paragraph style={{ margin: 0 }}>
                    Price changed from{" "}
                    <Text delete>{change.old_price.toLocaleString()}</Text> to{" "}
                    <Text style={{ color: "#722ED1", fontWeight: 500 }}>
                      {change.new_price.toLocaleString()}
                    </Text>
                  </Paragraph>
                  <Space size="middle" style={{ margin: "8px 0" }}>
                    {/* <Avatar size="small" src={change.updatedByAvatar} /> */}
                    <Text type="secondary">Updated by {change.updated_by}</Text>
                  </Space>
                  {change.reason && (
                    <div
                      style={{
                        backgroundColor: "#FAFAFA",
                        padding: "10px 12px",
                        borderRadius: 6,
                        marginTop: 4,
                        fontSize: 14,
                        color: "#595959",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      Reason: {change.reason}
                    </div>
                  )}
                </div>
              </Space>
              <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                {dayjs(change.created_at).format("MMM D, YYYY h:mm A")}
              </Text>
            </div>
            {idx < data.length - 1 && <Divider style={{ margin: "16px 0" }} />}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PriceHistoryCard;
