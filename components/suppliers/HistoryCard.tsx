"use client";

import {
  EyeOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Card, Space, Table, Typography } from "antd";

const HistoryCard = () => {
  const columns = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "orderId",
      key: "orderId",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "CONTACT PERSON",
      dataIndex: "orderId",
      key: "orderId",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "ORDER DATE",
      dataIndex: "date",
      key: "date",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "EXPECTED DELIVERY",
      dataIndex: "date",
      key: "date",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "AMOUNT",
      dataIndex: "amount",
      key: "amount",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "ACTIONS",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
  ];

  return (
    <Space size="middle" direction="vertical" style={{ width: "100%" }}>
      <Card
        styles={{
          header: {
            background:
              "linear-gradient(90deg, rgba(230, 247, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
            borderBottom: "1px solid #91D5FF",
          },
        }}
        title={
          <Space
            style={{
              margin: "10px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space>
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
                  background: "#40A9FF",
                }}
              >
                <ShoppingCartOutlined
                  style={{ marginTop: 6, marginRight: 2 }}
                />
              </Space>
              <Space direction="vertical" size={0}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Related Purchase Orders
                </Typography.Title>
                <Typography.Text type="secondary" style={{ margin: 0 }}>
                  Purchase Orders linked to this supplier
                </Typography.Text>
              </Space>
            </Space>

            <Space style={{ display: "flex", alignItems: "center" }}>
              <EyeOutlined style={{ fontSize: 14, color: "#40A9FF" }} />
              <Typography.Text
                style={{ color: "#40A9FF", fontSize: 14, fontWeight: 0 }}
              >
                View All Purchase Orders
              </Typography.Text>
            </Space>
          </Space>
        }
        variant="outlined"
        style={{ borderRadius: 12 }}
      >
        <Table
          size="middle"
          rowKey={"orderId"}
          pagination={false}
          columns={columns}
          dataSource={[
            {
              orderId: "PO12345",
              date: "2023-10-01",
              amount: "$500.00",
            },
            {
              orderId: "PO12346",
              date: "2023-10-05",
              amount: "$300.00",
            },
            {
              orderId: "PO12347",
              date: "2023-10-05",
              amount: "$300.00",
            },
            {
              orderId: "PO12348",
              date: "2023-10-05",
              amount: "$300.00",
            },
            {
              orderId: "PO12349",
              date: "2023-10-05",
              amount: "$300.00",
            },
          ]}
          bordered
        />
      </Card>

      <Card
        styles={{
          header: {
            background:
              "linear-gradient(90deg, rgba(255, 251, 230, 1) 0%, rgba(255, 255, 255, 0) 100%)",
            borderBottom: "1px solid #FFE58F",
          },
        }}
        title={
          <Space
            style={{
              margin: "10px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space>
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
                  background: "#FFC53D",
                }}
              >
                <FileTextOutlined />
              </Space>
              <Space direction="vertical" size={0}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Related Invoices
                </Typography.Title>
                <Typography.Text type="secondary" style={{ margin: 0 }}>
                  Invoices linked to this supplier
                </Typography.Text>
              </Space>
            </Space>

            <Space style={{ display: "flex", alignItems: "center" }}>
              <EyeOutlined style={{ fontSize: 14, color: "#40A9FF" }} />
              <Typography.Text
                style={{ color: "#40A9FF", fontSize: 14, fontWeight: 0 }}
              >
                View All Purchase Orders
              </Typography.Text>
            </Space>
          </Space>
        }
        variant="outlined"
        style={{ borderRadius: 12 }}
      >
        <Table
          size="middle"
          rowKey={"orderId"}
          pagination={false}
          columns={columns}
          dataSource={[
            { orderId: "PO12341", date: "2023-10-01", amount: "$500.00" },
            { orderId: "PO12342", date: "2023-10-05", amount: "$300.00" },
            { orderId: "PO12343", date: "2023-10-05", amount: "$300.00" },
            { orderId: "PO12344", date: "2023-10-05", amount: "$300.00" },
            { orderId: "PO12355", date: "2023-10-05", amount: "$300.00" },
          ]}
          bordered
        />
      </Card>
    </Space>
  );
};

export default HistoryCard;
