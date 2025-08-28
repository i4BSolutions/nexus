"use client";

import { ProductInterface } from "@/types/product/product.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
import { TagOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Typography } from "antd";

export type ProductDetailsCardProps = Omit<
  ProductInterface,
  "id" | "name" | "created_at" | "stock" | "currency_code_id" | "description"
>;

const DetailsCard = ({
  sku,
  category,
  min_stock,
  unit_price,
  updated_at,
}: ProductDetailsCardProps) => {
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
            <TagOutlined />
          </Space>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Product Information
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Last updated on{" "}
              {updated_at ? new Date(updated_at).toLocaleDateString() : "N/A"}
            </Typography.Text>
          </div>
        </Space>
      }
      variant="outlined"
      style={{ borderRadius: 12 }}
    >
      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Product SKU</Typography.Text>
            <Typography.Title level={5}>{sku}</Typography.Title>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Category</Typography.Text>
            <Typography.Title level={5}>{category}</Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Unit Price</Typography.Text>
            <Typography.Title level={5}>
              {formatWithThousandSeparator(unit_price) ?? "N/A"}
            </Typography.Title>
          </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">
              Minimum Stock Level
            </Typography.Text>
            <Typography.Title level={5}>{min_stock ?? "N/A"}</Typography.Title>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DetailsCard;
