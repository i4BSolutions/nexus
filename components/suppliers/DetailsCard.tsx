"use client";

import { ContactsOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Typography } from "antd";

export interface SupplierCardProps {
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

const DetailsCard = ({
  contact_person,
  email,
  phone,
  address,
}: SupplierCardProps) => {
  return (
    <Card
      styles={{
        header: {
          background:
            "linear-gradient(90deg, rgba(249, 240, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)",
          borderBottom: "1px solid #D3ADF7",
        },
      }}
      title={
        <Space style={{ margin: "12px 0" }}>
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
              marginRight: 8,
            }}
          >
            <ContactsOutlined />
          </Space>
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Contact Information
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Contact information of the supplier
            </Typography.Text>
          </Space>
        </Space>
      }
      variant="outlined"
    >
      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Contact Person</Typography.Text>
            <Typography.Title level={5}>{contact_person}</Typography.Title>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Email</Typography.Text>
            <Typography.Title level={5}>{email}</Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Phone</Typography.Text>
            <Typography.Title level={5}>{phone ?? "N/A"}</Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Address</Typography.Text>
            <Typography.Title level={5}>{address ?? "N/A"}</Typography.Title>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DetailsCard;
