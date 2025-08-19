"use client";

import { PurchaseInvoiceInterface } from "@/types/purchase-invoice/purchase-invoice.type";
import { FileTextOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Table, TableProps, Typography } from "antd";

const DetailsCard = ({ data }: { data: PurchaseInvoiceInterface }) => {
  // Total amount handler
  const getTotal = () => {
    const items = data.invoice_items;
    const exchangeRate = data.usd_exchange_rate;
    let totalLocal = 0;

    if (items) {
      items.forEach((item: any) => {
        const price = item.unit_price_local || 0;
        totalLocal += (item.quantity || 0) * price;
      });
    }

    const totalUSD = exchangeRate
      ? (totalLocal / exchangeRate).toFixed(2)
      : "0.00";

    return {
      totalLocal: totalLocal.toLocaleString(),
      totalUSD: totalUSD.toLocaleString(),
    };
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "PRODUCT",
      dataIndex: "product_name",
      key: "product_name",
      render: (product_name) => <span>{product_name}</span>,
    },
    {
      title: "ORDERED",
      dataIndex: "total_ordered",
      key: "total_ordered",
      defaultSortOrder: "descend",
      render: (total_ordered) => <span>{total_ordered}</span>,
    },
    {
      title: "PO UNIT PRICE",
      dataIndex: "unit_price_local",
      key: "unit_price_local",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {record.po_unit_price_local.toFixed(2).toLocaleString()}{" "}
            {data.purchase_order_currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.po_unit_price_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "INV QUANTITY",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span>{quantity}</span>,
    },
    {
      title: "INV UNIT PRICE",
      dataIndex: "unit_price_local",
      key: "unit_price_local_display",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {record.unit_price_local.toFixed(2).toLocaleString()}{" "}
            {data.currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.unit_price_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "right" }}>
          <Typography.Text>SUBTOTAL</Typography.Text>
        </div>
      ),
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_, record) => (
        <div
          style={{
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography.Text>
            {record.sub_total_local.toFixed(2).toLocaleString()}{" "}
            {data.purchase_order_currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.sub_total_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <Card
      styles={{
        header: {
          background: "linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)",
          borderBottom: "1px solid #FFE58F",
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
              background: "#FFC53D",
              marginRight: 8,
            }}
          >
            <FileTextOutlined />
          </Space>
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Invoice Details
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Details and information about this invoice
            </Typography.Text>
          </Space>
        </Space>
      }
      variant="outlined"
    >
      <Row gutter={24} style={{ marginTop: 0 }}>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Invoice Date</Typography.Text>
            <Typography.Title level={5}>{data?.invoice_date}</Typography.Title>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Due Date</Typography.Text>
            <Typography.Title level={5}>{data?.due_date}</Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Currency</Typography.Text>
            <Typography.Title level={5}>{data?.currency_code}</Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Exchange Rate</Typography.Text>
            <Typography.Title level={5}>
              1 USD = {data?.usd_exchange_rate} {data?.currency_code}
            </Typography.Title>
          </Space>
        </Col>

        <Col span={24} style={{ marginTop: 16 }}>
          <div
            style={{
              border: "1px solid #F0F0F0",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <Space style={{ marginBottom: "4px" }}>
              <Typography.Text type="secondary">Invoice Items</Typography.Text>
            </Space>
            <Table
              columns={columns}
              dataSource={data?.invoice_items || []}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
            />
            <Space
              direction="vertical"
              size={0}
              style={{ marginTop: 16, textAlign: "right", width: "100%" }}
            >
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                Total Amount
              </Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {data ? getTotal().totalLocal : "0"} {data?.currency_code}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                ({data ? getTotal().totalUSD : "0.00 USD"}) USD
              </Typography.Text>
            </Space>
          </div>
        </Col>

        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Note</Typography.Text>
            <Typography.Title level={5}>
              {data?.note ? data?.note : "No notes available"}
            </Typography.Title>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DetailsCard;
