import {
  ProductCurrencyInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { InvoiceFieldType } from "@/types/purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderResponse } from "@/types/purchase-order/purchase-order.type";
import getCurrencyCode from "@/utils/getCurrencyCode";
import { FileTextOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { Avatar, Col, Flex, Form, Row, Space, Typography } from "antd";

export default function InvoiceThirdStep({
  form,
  poDetailData,
  currenciesData,
  purchaseOrdersData,
  productsData,
}: {
  form: FormInstance<InvoiceFieldType>;
  poDetailData: PurchaseOrderDetailDto;
  currenciesData: ProductCurrencyInterface[];
  purchaseOrdersData: PurchaseOrderResponse;
  productsData: ProductResponse;
}) {
  return (
    <section className="w-full">
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 12 }}>
        <Col style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            icon={<FileTextOutlined />}
            size={40}
            style={{ color: "white", background: "#FFC53D" }}
          />
          <Flex vertical align="start">
            <span style={{ fontSize: 22, fontWeight: 600 }}>
              {form.getFieldValue("invoiceNumber") || "PO-XXXX-XXXX"}
            </span>
            <div className="px-2 rounded-lg border border-[#D9D9D9]">
              Pending
            </div>
          </Flex>
        </Col>
      </Row>

      {/* Top summary */}
      <Row gutter={32} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">Invoice Date</Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {form.getFieldValue("invoice_date") || "N/A"}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">Due Date</Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {form.getFieldValue("due_date") || "N/A"}
            </Typography.Text>
          </Flex>
        </Col>
      </Row>

      {/* Currency and Exchange Rate */}
      <Row gutter={32} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">Currency</Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {form.getFieldValue("currency") || "N/A"}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">
              USD Exchange Rate
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {form.getFieldValue("usd_exchange_rate") || "N/A"}
            </Typography.Text>
          </Flex>
        </Col>
      </Row>

      {/* Invoice Detail Table */}
      <div className="rounded-lg border-2 border-[#0000000f] p-4">
        <Typography.Text type="secondary" style={{ margin: 0 }}>
          Items
        </Typography.Text>
        <Form.List name={"invoice_items"}>
          {(fields) => (
            <>
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Row
                  gutter={16}
                  style={{
                    fontWeight: 600,
                    padding: "12px",
                    background: "#fafafa",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                  align="middle"
                >
                  <Col span={6}>PRODUCT</Col>
                  <Col span={2}>ORDERED</Col>
                  <Col span={2}>AVAILABLE</Col>
                  <Col span={3}>PO UNIT PRICE</Col>
                  <Col span={3}>INV QUANTITY</Col>
                  <Col span={4}>INV UNIT PRICE (THB)</Col>
                  <Col span={2}>SUBTOTAL</Col>
                </Row>

                {/* Line Items to Review*/}
                {fields.map(({ name, key, ...restField }, index) => {
                  return (
                    <Row
                      key={key}
                      gutter={16}
                      align="middle"
                      style={{
                        padding: "12px 20px",
                        borderBottom:
                          index !== fields.length - 1
                            ? "1px solid #f0f0f0"
                            : undefined,
                      }}
                    >
                      <Col span={6} style={{ padding: 0 }}>
                        <Form.Item {...restField} style={{ marginBottom: 0 }}>
                          {poDetailData?.product_items.length && (
                            <Typography.Text
                              style={{
                                margin: 0,
                                padding: 0,
                                display: "block",
                              }}
                            >
                              {poDetailData.product_items[name]?.product_name}
                            </Typography.Text>
                          )}
                        </Form.Item>
                      </Col>

                      {/* Ordered and Available Quantities */}
                      <Col span={2}>
                        {productsData?.items?.length && (
                          <Typography.Text
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            9
                          </Typography.Text>
                        )}
                      </Col>

                      <Col span={1}>
                        {productsData?.items?.length && (
                          <Typography.Text
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            9
                          </Typography.Text>
                        )}
                      </Col>

                      {/* PO Unit Price */}
                      <Col span={4}>
                        {productsData?.items?.length && (
                          <div className="flex flex-col ml-11">
                            <Typography.Text
                              style={{
                                marginBottom: 0,
                              }}
                              strong
                            >
                              {"32,000".toLocaleString()}{" "}
                              {getCurrencyCode(
                                productsData.items[name]?.currency_code_id,
                                currenciesData
                              )}
                            </Typography.Text>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              (
                              {(
                                productsData.items[name]?.unit_price ?? 0
                              ).toLocaleString()}{" "}
                              USD)
                            </Typography.Text>
                          </div>
                        )}
                      </Col>

                      {/* INV Quantity */}
                      <Col span={3}>
                        {
                          form.getFieldValue("invoice_items")[name]
                            .invoice_quantity
                        }
                      </Col>

                      {/* INV Unit Price */}
                      <Col span={4}>
                        {
                          form.getFieldValue("invoice_items")[name]
                            .invoice_unit_price_local
                        }
                      </Col>

                      {/* Subtotal */}
                      <Col span={3} style={{ marginLeft: 4 }}>
                        <div>
                          <Typography.Text strong>
                            {"20000".toLocaleString()}{" "}
                            {getCurrencyCode(
                              form.getFieldValue("currency"),
                              currenciesData
                            )}
                          </Typography.Text>
                          <div style={{ fontSize: 12, color: "#aaa" }}>
                            ({"20000".toLocaleString()} USD)
                          </div>
                        </div>
                      </Col>
                    </Row>
                  );
                })}
              </div>
              <Row gutter={16}>
                <Col span={12}></Col>
                <Col span={12} style={{ textAlign: "right", marginTop: 16 }}>
                  <Space direction="vertical" size="small" style={{ gap: 0 }}>
                    <Typography.Text type="secondary">
                      Total Amount
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {/* {getTotal().totalLocal} {getTotal().currencyCode} */}
                      132,000 THB
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {/* ({getTotal().totalUSD} USD) */}
                      (3,800 USD)
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            </>
          )}
        </Form.List>
      </div>
    </section>
  );
}
