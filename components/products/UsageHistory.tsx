import React from "react";
import CurrentStockCard from "./CurrentStockCard";
import LastStockMovementCard from "./LastStockMovementCard";
import {
  Button,
  Card,
  Divider,
  Flex,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  ProductPurchaseOrder,
  ProductUsageHistory,
} from "@/types/product/product.type";
import dayjs from "dayjs";

const UsageHistory = ({ data }: { data: ProductUsageHistory }) => {
  const { purchase_orders, last_stock_movement, minimum_stock, current_stock } =
    data;
  console.log(purchase_orders);
  const columns: TableProps<ProductPurchaseOrder>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_no",
      key: "purchase_order_no",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (purchase_order_no) => (
        <Typography.Text>{purchase_order_no}</Typography.Text>
      ),
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier_name",
      key: "supplier_name",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (supplier_name) => (
        <Typography.Text>{supplier_name}</Typography.Text>
      ),
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
      key: "order_date",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (order_date) => (
        <Flex align="center" gap={3}>
          <CalendarOutlined />
          <Typography.Text>
            {dayjs(order_date).format("MMM D, YYYY")}
          </Typography.Text>
        </Flex>
      ),
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
      render: (unit_price) => <Typography.Text>{unit_price}</Typography.Text>,
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
      render: (amount) => <Typography.Text>{amount}</Typography.Text>,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (status: string) => (
        <Tag color={status === "Approved" ? "green" : "#FAFAFA"}>
          <Typography.Text style={{ color: "#000" }}>{status}</Typography.Text>
        </Tag>
      ),
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
        <CurrentStockCard stock={current_stock} minStock={minimum_stock} />
        <LastStockMovementCard
          data={last_stock_movement}
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
          dataSource={purchase_orders}
          rowKey="product_id"
          bordered
        />
      </Card>
    </>
  );
};

export default UsageHistory;
