"use client";
import React from "react";
import { Row, Col, Card, Progress, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

export type StatItem = {
  title: string;
  value: number | string;
  tooltip?: string;
  icon: React.ReactNode;
  bgColor: string;
  gradient: string;
  borderColor: string;
  isCurrency?: boolean;
  showProgress?: boolean;
  progressPercent?: number;
  bottomText?: string;
};

const StatisticsCards = ({ stats }: { stats: StatItem[] }) => {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((item, index) => (
        <Col xs={24} sm={12} md={12} lg={6} key={index}>
          <Card
            size="small"
            styles={{
              body: {
                padding: "12px 24px",
                minHeight: 121,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              },
            }}
            style={{
              borderRadius: 12,
              borderColor: item.borderColor,
              background: item.gradient,
              boxSizing: "border-box",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500 }}>
                {item.title}{" "}
                {item.tooltip && (
                  <Tooltip title={item.tooltip}>
                    <InfoCircleOutlined
                      style={{ marginLeft: 4, color: "#999" }}
                    />
                  </Tooltip>
                )}
              </span>
              <div
                style={{
                  background: item.bgColor,
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.cloneElement(item.icon as any, {
                  style: { color: "white", fontSize: 16 },
                })}
              </div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {item.isCurrency && typeof item.value === "number"
                ? `${item.value.toLocaleString()}`
                : item.value}
            </div>

            <div style={{ fontSize: 12, color: "#888" }}>{item.bottomText}</div>

            <div style={{}}>
              {item.showProgress &&
                typeof item.progressPercent === "number" && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Progress
                      percent={item.progressPercent}
                      strokeColor={item.bgColor}
                      trailColor="#f0f0f0"
                      showInfo={false}
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <span style={{ fontSize: 14 }}>
                      {item.progressPercent.toFixed(2)}%
                    </span>
                  </div>
                )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;
