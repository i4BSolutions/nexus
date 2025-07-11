import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderItemInterface } from "@/types/purchase-order/purchase-order-item.type";
import { TagOutlined } from "@ant-design/icons";
import { Col, Flex, Row, Space, Typography } from "antd";

export default function PoDetailView({
  data,
}: {
  data: PurchaseOrderDetailDto;
}) {
  return (
    <section className="w-full rounded-2xl border-2 border-[#F5F5F5]">
      {/* Detail Header */}
      <Flex
        align="center"
        gap={16}
        style={{
          padding: "16px 24px",
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
          borderBottom: "1px solid #D3ADF7",
        }}
      >
        <TagOutlined
          style={{
            width: 32,
            height: 32,
            background: "#9254DE",
            borderRadius: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 20,
          }}
        />
        <div>
          <Typography.Title level={3} className="!mb-0">
            Purchase Order Details
          </Typography.Title>
          <Typography.Text type="secondary">
            Details and information about this purchase order
          </Typography.Text>
        </div>
      </Flex>

      {/* Detail Content */}
      <div className="px-6 py-7">
        <Row gutter={32} style={{ marginBottom: 8 }}>
          <Col span={12}>
            <Space size="small" direction="vertical">
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">Supplier</Typography.Text>
                </Space>
                <Space>
                  <Typography.Title level={5}>{data.supplier}</Typography.Title>
                </Space>
              </Space>
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">Order Date</Typography.Text>
                </Space>
                <Space>
                  <Typography.Title level={5}>
                    {data.order_date}
                  </Typography.Title>
                </Space>
              </Space>
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">Budget</Typography.Text>
                </Space>
                <Space>
                  <Typography.Title level={5}>{data.budget}</Typography.Title>
                </Space>
              </Space>
            </Space>
          </Col>
          <Col span={12}>
            <Space size="small" direction="vertical">
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">Region</Typography.Text>
                </Space>
                <Space>
                  <Typography.Title level={5}>{data.region}</Typography.Title>
                </Space>
              </Space>
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">
                    Expected Delivery Date
                  </Typography.Text>
                </Space>
                <Space>
                  <Typography.Title level={5}>
                    {data.expected_delivery_date}
                  </Typography.Title>
                </Space>
              </Space>
              <Space direction="vertical" size={0}>
                <Space>
                  <Typography.Text type="secondary">Currency</Typography.Text>
                </Space>
                <Space style={{ display: "flex", alignItems: "center" }}>
                  <Typography.Title level={5} style={{ marginBottom: 0 }}>
                    {data.currency_code}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    (1USD = {data.usd_exchange_rate?.toLocaleString()}{" "}
                    {data.currency_code})
                  </Typography.Text>
                </Space>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Items Table */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            overflow: "hidden",
            padding: 12,
          }}
        >
          <Typography.Text type="secondary">Items</Typography.Text>

          <Row
            gutter={16}
            style={{
              margin: "0 6px 0 0",
              fontWeight: 600,
              padding: "12px 12px",
              background: "#fafafa",
              borderBottom: "1px solid #e0e0e0",
              borderRadius: "8px 8px 0 0",
              borderLeft: "1px solid #e0e0e0",
              borderRight: "1px solid #e0e0e0",
              borderTop: "1px solid #e0e0e0",
            }}
            align="middle"
          >
            <Col span={6}>PRODUCT</Col>
            <Col span={4}>QUANTITY</Col>
            <Col span={7}>UNIT PRICE</Col>
            <Col span={7} style={{ textAlign: "right" }}>
              SUBTOTAL
            </Col>
          </Row>
          {data.product_items.map(
            (item: PurchaseOrderItemInterface, index: number) => (
              <Row
                key={item.id}
                gutter={16}
                style={{
                  margin: "0 6px 0 0",
                  padding: "12px 8px",
                  borderLeft: "1px solid #e0e0e0",
                  borderRight: "1px solid #e0e0e0",
                  borderBottom: "1px solid #e0e0e0",
                  borderRadius:
                    index !== data.product_items.length - 1
                      ? "0"
                      : "0 0 8px 8px",
                }}
              >
                <Col span={6}>{item.product_name}</Col>

                <Col span={4}>{item.quantity}</Col>

                <Col span={7}>
                  {item.unit_price_local.toLocaleString()} {data.currency_code}
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    ({item.unit_price_usd.toLocaleString()} USD)
                  </Typography.Text>
                </Col>

                <Col span={7} style={{ textAlign: "right" }}>
                  {item.sub_total_local.toLocaleString()} {data.currency_code}
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    ({item.sub_total_usd.toLocaleString()} USD)
                  </Typography.Text>
                </Col>
              </Row>
            )
          )}

          <Space
            direction="vertical"
            size={0}
            style={{
              textAlign: "right",
              marginTop: 12,
              paddingRight: 10,
              width: "100%",
            }}
          >
            <Typography.Text type="secondary">Total Amount</Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {data.total_amount_local.toLocaleString()} {data.currency_code}
            </Typography.Title>
            <Typography.Text type="secondary">
              ({data.total_amount_usd.toLocaleString()} USD)
            </Typography.Text>
          </Space>
        </div>

        {/* Bottom section: Contact, Sign, Authorized, Note */}
        <Row gutter={32} style={{ marginTop: 12 }}>
          <Col span={12} style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">Contact Person</Typography.Text>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {data.contact_person}
            </div>
          </Col>
          <Col span={12} style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">Sign Person</Typography.Text>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {data.sign_person ? (
                data.sign_person
              ) : (
                <Typography.Text type="secondary">
                  No sign person
                </Typography.Text>
              )}
            </div>
          </Col>
          <Col span={12} style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">
              Authorized Sign Person
            </Typography.Text>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {data.authorized_sign_person ? (
                data.authorized_sign_person
              ) : (
                <Typography.Text type="secondary">
                  No authorized sign person
                </Typography.Text>
              )}
            </div>
          </Col>
          <Col span={12} style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">Note</Typography.Text>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {data.note ? (
                data.note
              ) : (
                <Typography.Text type="secondary">
                  No additional notes
                </Typography.Text>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
