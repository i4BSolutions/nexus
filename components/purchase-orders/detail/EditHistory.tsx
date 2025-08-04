"use client";

import { PurchaseOrderHistory } from "@/types/purchase-order/purchase-order.type";
import {
  EditOutlined,
  CalendarOutlined,
  SwapOutlined,
  TableOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Space, Typography, Tag, Tooltip } from "antd";

const { Title, Text } = Typography;

const fieldIcons: Record<string, React.ReactNode> = {
  invoice_date: <CalendarOutlined />,
  due_date: <CalendarOutlined />,
  exchange_rate_to_usd: <SwapOutlined />,
  note: <TableOutlined />,
  status: <DollarCircleOutlined />,
};

const EditHistory = ({ data }: { data: PurchaseOrderHistory[] }) => {
  const renderUpdateBlock = (
    icon: React.ReactNode,
    field: string,
    oldValue: string,
    newValue: string,
    updatedBy: string,
    changedAt: string,
    reason?: string
  ) => (
    <Card
      key={`${field}-${changedAt}`}
      style={{ marginBottom: 16, width: "100%" }}
    >
      <Row justify="space-between" align="top">
        {/* Left: icon + content */}
        <Col>
          <Space align="start">
            <Space
              style={{
                width: 32,
                height: 32,
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 20,
                color: "white",
                background: "#BFBFBF",
              }}
            >
              {icon}
            </Space>
            <Space direction="vertical" size={4}>
              <Title level={5} style={{ margin: 0 }}>
                {field
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                Updated
              </Title>
              <Text>
                <Text strong>
                  {field
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>{" "}
                changed from <Text delete>{oldValue}</Text> to{" "}
                <Text style={{ color: "#722ED1" }}>{newValue}</Text>
              </Text>
              <Space>
                <Space
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 16,
                    color: "white",
                    background: "#BFBFBF",
                  }}
                >
                  A
                </Space>
                <Text type="secondary">Updated by {updatedBy}</Text>
              </Space>
              {reason && <Text type="secondary">Reason: {reason}</Text>}
            </Space>
          </Space>
        </Col>

        {/* Right: timestamp */}
        <Col>
          <Text type="secondary">
            {new Date(changedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Card
      styles={{
        header: {
          background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
          borderBottom: "1px solid #D3ADF7",
        },
      }}
      title={
        <Space style={{ margin: "10px 0" }}>
          <Space
            style={{
              width: 32,
              height: 32,
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 20,
              color: "white",
              background: "#9254DE",
            }}
          >
            <EditOutlined />
          </Space>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>
              Edit History
            </Title>
            <Text type="secondary" style={{ margin: 0 }}>
              {data?.[0]?.changed_at
                ? `Last updated on ${new Date(
                    data[data.length - 1].changed_at
                  ).toLocaleString()}`
                : "No updates yet"}
            </Text>
          </Space>
        </Space>
      }
      variant="outlined"
    >
      <Row gutter={16}>
        {data?.map((log) =>
          renderUpdateBlock(
            fieldIcons[log.changed_field] || <EditOutlined />,
            log.changed_field,
            log.old_values,
            log.new_values,
            log.changed_by,
            log.changed_at,
            log.reason
          )
        )}
      </Row>
    </Card>
  );
};

export default EditHistory;
