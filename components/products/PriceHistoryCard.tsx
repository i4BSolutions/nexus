"use client";

import { ProductHistoryPaginatedResponse } from "@/types/product/product.type";
import { ExclamationCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import { Card, Divider, Pagination, Space, Typography } from "antd";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const PriceHistoryCard = ({
  data,
}: {
  data: ProductHistoryPaginatedResponse;
}) => {
  return (
    <section className="py-4 mb-2">
      <Card
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
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
                marginRight: 8,
              }}
            >
              <HistoryOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Product Log
              </Title>
              <Text type="secondary">
                Last updated on{" "}
                {dayjs(data.items[0]?.changed_at).format("MMM D, YYYY h:mm A")}
              </Text>
            </div>
          </Space>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px" }}>
          {data.items.map((change, idx) => (
            <div key={change.id} style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                }}
              >
                {/* Icon */}
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
                    flexShrink: 0,
                  }}
                >
                  <ExclamationCircleOutlined />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <Text strong>{change.changed_field} Updated</Text>
                      <Paragraph style={{ margin: 0 }}>
                        {change.changed_field} changed from{" "}
                        <Text delete>{change.old_values.toLocaleString()}</Text>{" "}
                        to{" "}
                        <Text style={{ color: "#722ED1", fontWeight: 500 }}>
                          {change.new_values.toLocaleString()}
                        </Text>
                      </Paragraph>
                      <Space size="small" style={{ margin: "8px 0" }}>
                        {/* {change.updated_by_avatar && (
                        <img
                          src={change.updated_by_avatar}
                          alt={change.updated_by}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )} */}
                        <Text type="secondary">
                          {change.is_system ? (
                            <span>System</span>
                          ) : (
                            <span>
                              Updated by {change?.user_profiles.full_name}
                            </span>
                          )}
                        </Text>
                      </Space>
                    </div>
                    <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                      {dayjs(change.changed_at).format("MMM D, YYYY h:mm A")}
                    </Text>
                  </div>
                  {/* 
                {change.reason && (
                  <div
                    style={{
                      backgroundColor: "#FAFAFA",
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: 14,
                      color: "#595959",
                      marginTop: 12,
                      border: "1px solid #f0f0f0",
                      width: "100%",
                    }}
                  >
                    Reason: {change.reason}
                  </div>
                )} */}
                </div>
              </div>

              {idx < data.items.length - 1 && (
                <Divider style={{ margin: "16px 0" }} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default PriceHistoryCard;
