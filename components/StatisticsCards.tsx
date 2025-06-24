import React from "react";
import { Row, Col, Card, Statistic, Space } from "antd";

type StatItem = {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  gradient: string;
  borderColor: string;
};

const StatisticsCards = ({ stats }: { stats: StatItem[] }) => (
  <Row gutter={16} className="mb-6">
    {stats.map((item, index) => (
      <Col span={8} key={index}>
        <Card
          size="small"
          style={{
            borderColor: item.borderColor,
            background: item.gradient,
            padding: "12px 24px",
          }}
        >
          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Statistic title={item.title} value={item.value} />
            <div
              style={{
                width: 32,
                height: 32,
                background: item.bgColor,
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {React.cloneElement(item.icon as any, {
                style: { fontSize: 20, color: "white" },
              })}
            </div>
          </Space>
        </Card>
      </Col>
    ))}
  </Row>
);

export default StatisticsCards;
