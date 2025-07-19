"use client";

import { ShoppingCartOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Table, TableProps, Typography } from "antd";
import StatusBadge from "./StatusBadge";
import Link from "antd/es/typography/Link";

const LinkedPO = ({ data }: { data: any }) => {
  const dataSource = [
    {
      id: data.id,
      purchase_order_no: data.purchase_order_no,
      supplier: data.supplier,
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date,
      currency_code: data.currency_code,
      total_amount_local: data.total_amount_local,
      total_amount_usd: data.total_amount_usd,
      status: "Pending", // You can dynamically derive this if available
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_no",
      key: "purchase_order_no",
      render: (purchase_order_no) => (
        <Link href={`/purchase-orders/${data.purchase_order_no}`}>
          {purchase_order_no}
        </Link>
      ),
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier",
      key: "supplier",
      defaultSortOrder: "descend",
      render: (supplier) => <span>{supplier}</span>,
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
      key: "order_date",
      render: (order_date) => <span>{order_date}</span>,
    },
    {
      title: "EXPECTED DELIVERY DATE",
      dataIndex: "expected_delivery_date",
      key: "expected_delivery_date",
      render: (expected_delivery_date) => <span>{expected_delivery_date}</span>,
    },
    {
      title: "AMOUNT",
      dataIndex: "total_amount_usd",
      key: "total_amount_usd",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {record.total_amount_local.toLocaleString()} {record.currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.total_amount_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <Card
      styles={{
        header: {
          background:
            "linear-gradient(90deg, #E6F7FF 0%, rgba(255, 255, 255, 0.00) 100%)",
          borderBottom: "1px solid #91D5FF",
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
              background: "#40A9FF",
            }}
          >
            <ShoppingCartOutlined />
          </Space>
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Related Purchase Order
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Purchase Order linked to this invoice
            </Typography.Text>
          </Space>
        </Space>
      }
      variant="outlined"
    >
      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={24} style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="id"
            scroll={{ x: true }}
            style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default LinkedPO;
