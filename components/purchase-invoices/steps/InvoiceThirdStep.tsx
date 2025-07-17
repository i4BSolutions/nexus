import {
  ProductCurrencyInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { InvoiceFieldType } from "@/types/purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderResponse } from "@/types/purchase-order/purchase-order.type";
import getCurrencyCode from "@/utils/getCurrencyCode";
import { CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { Avatar, Button, Col, Flex, Form, Row, Space, Typography } from "antd";

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
  const invoiceItems = form.getFieldValue("invoice_items");
  const currencyId = form.getFieldValue("currency");
  const exchangeRate = form.getFieldValue("usd_exchange_rate");

  const calculateTotals = () => {
    let totalLocal = 0;
    let totalUSD = 0;

    invoiceItems?.forEach((item: any) => {
      if (
        item?.checked &&
        item?.invoice_quantity &&
        item?.invoice_unit_price_local
      ) {
        const subtotal = item.invoice_quantity * item.invoice_unit_price_local;
        totalLocal += subtotal;
        if (exchangeRate && exchangeRate > 0) {
          totalUSD += subtotal / exchangeRate;
        }
      }
    });

    return {
      totalLocal,
      totalUSD,
    };
  };

  const { totalLocal, totalUSD } = calculateTotals();

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
              {form.getFieldValue("invoice_number") || "PO-XXXX-XXXX"}
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
              {form.getFieldValue("invoice_date")
                ? form.getFieldValue("invoice_date").format("MMM DD YYYY")
                : "N/A"}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">Due Date</Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {form.getFieldValue("due_date")
                ? form.getFieldValue("due_date").format("MMM DD YYYY")
                : "N/A"}{" "}
            </Typography.Text>
          </Flex>
        </Col>
      </Row>

      {/* Currency and Exchange Rate */}
      <Row gutter={32} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">Currency</Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {getCurrencyCode(form.getFieldValue("currency"), currenciesData)}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text type="secondary">
              USD Exchange Rate
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              1 USD = {form.getFieldValue("usd_exchange_rate")}{" "}
              {getCurrencyCode(form.getFieldValue("currency"), currenciesData)}
            </Typography.Text>
          </Flex>
        </Col>
      </Row>

      {/* Invoice Detail Table */}
      <div className="rounded-lg border-2 border-[#0000000f] p-4">
        {/* Purchase Order Table */}
        <Typography.Text type="secondary" style={{ margin: 0 }}>
          Purchase Order
        </Typography.Text>
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            marginBottom: 24,
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
            <Col span={4}>PURCHASE ORDER</Col>
            <Col span={4}>SUPPLIER</Col>
            <Col span={4}>ORDER DATE</Col>
            <Col span={5}>EXPECTED DELIVERY DATE</Col>
            <Col span={4}>AMOUNT</Col>
            <Col span={3}>STATUS</Col>
          </Row>

          <Row
            gutter={16}
            style={{
              padding: "12px 0",
            }}
            align="middle"
          >
            <Col span={4}>
              <Button type="link">{poDetailData.purchase_order_no}</Button>
            </Col>
            <Col span={4}>
              <span className="pl-2">{poDetailData.supplier.name}</span>
            </Col>
            <Col span={4}>
              <div className="flex items-center gap-1.5 pl-1">
                <CalendarOutlined />
                <span>{poDetailData.order_date}</span>
              </div>
            </Col>
            <Col span={5}>
              <div className="flex items-center gap-1.5">
                <CalendarOutlined />
                <span>{poDetailData.expected_delivery_date}</span>
              </div>
            </Col>
            <Col span={3} style={{ margin: 0, padding: 0 }}>
              <div className="flex flex-col">
                <Typography.Text strong>
                  {poDetailData.total_amount_local.toLocaleString()}{" "}
                  {poDetailData.currency.currency_code}
                </Typography.Text>
                <Typography.Text type="secondary">
                  ({poDetailData.total_amount_usd.toLocaleString()} USD)
                </Typography.Text>
              </div>
            </Col>
            <Col span={3} style={{ paddingLeft: 40 }}>
              <div className="rounded-lg px-2 border border-[#D9D9D9] w-fit">
                Not Started
              </div>
            </Col>
          </Row>
        </div>
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
                  <Col span={3}>ORDERED</Col>
                  <Col span={3}>AVAILABLE</Col>
                  <Col span={3}>PO UNIT PRICE</Col>
                  <Col span={3}>INV QUANTITY</Col>
                  <Col span={3}>INV UNIT PRICE</Col>
                  <Col span={3}>SUBTOTAL</Col>
                </Row>

                {/* Line Items to Review*/}
                {fields
                  .filter(({ name }) => invoiceItems?.[name]?.checked)
                  .map(({ name, key, ...restField }, index) => {
                    const invoiceItem = invoiceItems?.[name];
                    if (!invoiceItem) return null;
                    const qty = invoiceItem.invoice_quantity || 0;
                    const price = invoiceItem.invoice_unit_price_local || 0;
                    const price_usd = price / exchangeRate || 0;
                    const subtotal = qty * price;
                    const subtotal_usd =
                      exchangeRate && exchangeRate > 0
                        ? subtotal / exchangeRate
                        : 0;
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
                        <Col span={3}>
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

                        <Col span={3}>
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
                        <Col span={3}>
                          {poDetailData?.product_items?.length && (
                            <div className="flex flex-col">
                              <Typography.Text
                                style={{
                                  marginBottom: 0,
                                }}
                                strong
                              >
                                {poDetailData?.product_items[
                                  name
                                ]?.unit_price_local?.toLocaleString() || 0}{" "}
                                {poDetailData?.currency.currency_code}
                              </Typography.Text>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                              >
                                (
                                {(
                                  poDetailData?.product_items[name]
                                    ?.unit_price_usd || 0
                                ).toLocaleString()}
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
                        <Col span={3} style={{ padding: "0 12px" }}>
                          <Typography.Text strong>
                            {
                              form.getFieldValue("invoice_items")[name]
                                .invoice_unit_price_local
                            }{" "}
                            {getCurrencyCode(
                              form.getFieldValue("currency"),
                              currenciesData
                            )}
                          </Typography.Text>
                          <div style={{ fontSize: 12, color: "#aaa" }}>
                            ({price_usd.toLocaleString()} USD)
                          </div>
                        </Col>

                        {/* Subtotal */}
                        <Col span={3} style={{ padding: "0 12px" }}>
                          <div>
                            <Typography.Text strong>
                              {subtotal.toLocaleString()}{" "}
                              {getCurrencyCode(
                                form.getFieldValue("currency"),
                                currenciesData
                              )}
                            </Typography.Text>
                            <div style={{ fontSize: 12, color: "#aaa" }}>
                              ({subtotal_usd.toLocaleString()} USD)
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
                      {totalLocal.toLocaleString()}{" "}
                      {getCurrencyCode(currencyId, currenciesData)}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      ({(totalUSD || 0).toLocaleString()} USD)
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            </>
          )}
        </Form.List>
      </div>
      <div className="flex flex-col gap-1 mt-6">
        <Typography.Text type="secondary" style={{ margin: 0 }}>
          Note
        </Typography.Text>
        <Typography.Text
          type="secondary"
          strong
          style={{ margin: 0, fontSize: 16 }}
        >
          {form.getFieldValue("note") || "No notes available"}
        </Typography.Text>
      </div>
    </section>
  );
}
