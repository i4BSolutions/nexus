import React from "react";
import CurrentStockCard from "./CurrentStockCard";
import LastStockMovementCard from "./LastStockMovementCard";
import { Button, Card, Divider, Space, Table, Tag, Typography } from "antd";
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const UsageHistory = () => {
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
      title: "SUPPLIER",
      dataIndex: "supplier",
      key: "supplier",
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
      title: "UNIT PRICE",
      dataIndex: "unit_price",
      key: "unit_price",
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
      render: (status: string) => {
        if (status === "APPROVED") return <Tag color="#52C41A">APPROVED</Tag>;

        return <Tag color="#F5222D">In Stock</Tag>;
      },
    },
    {
      title: "ACTIONS",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (_: any) => (
        <Button
          type="link"
          // onClick={() => handleView(product)}
          style={{ padding: 0 }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 24,
          flexDirection: "row",
        }}
      >
        <CurrentStockCard stock={400} minStock={200} />
        <LastStockMovementCard
          datetime="2025-06-14T06:17:00"
          status="in"
          quantity={200}
          invoiceNumber="INV-2025-0001-07"
          warehouse="Warehouse East"
          processedBy="Min Min"
          onViewAll={() => console.log("Go to movements list")}
        />
      </div>
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
        style={{ borderRadius: 16, marginTop: 12 }}
      >
        <Table
          size="middle"
          pagination={false}
          columns={columns}
          dataSource={[
            {
              orderId: "PO12345",
              supplier: "Apple",
              date: "2023-10-01",
              amount: "$500.00",
              status: "APPROVED",
            },
            {
              orderId: "PO12346",
              supplier: "Samsung",
              date: "2023-10-05",
              amount: "$300.00",
              status: "APPROVED",
            },
            {
              orderId: "PO12347",
              supplier: "Apple",
              date: "2023-10-05",
              amount: "$300.00",
              status: "APPROVED",
            },
          ]}
          bordered
        />
      </Card>
    </>
  );
};

export default UsageHistory;
