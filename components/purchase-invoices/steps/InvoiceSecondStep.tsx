import {
  ProductCurrencyInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { InvoiceFieldType } from "@/types/purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderResponse } from "@/types/purchase-order/purchase-order.type";
import getCurrencyCode from "@/utils/getCurrencyCode";
import type { FormInstance } from "antd";
import {
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useWatch } from "antd/es/form/Form";

export default function InvoiceSecondStep({
  form,
  poDetailData,
  currenciesData,
  purchaseOrdersData,
  productsData,
  poDetailLoading,
}: {
  form: FormInstance<InvoiceFieldType>;
  poDetailData: PurchaseOrderDetailDto;
  currenciesData: ProductCurrencyInterface[];
  purchaseOrdersData: PurchaseOrderResponse;
  productsData: ProductResponse;
  poDetailLoading: boolean;
}) {
  const invoiceItems = useWatch("invoice_items", form);
  const currencyId = useWatch("currency", form);
  const exchangeRate = useWatch("usd_exchange_rate", form);

  const calculateTotals = () => {
    let totalLocal = 0;
    let totalUSD = 0;

    invoiceItems?.forEach((item) => {
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
      <Form.Item<InvoiceFieldType>
        name="purchase_order"
        label="Purchase Order"
        style={{ width: "100%" }}
        rules={[{ required: true, message: "Please select purchase order!" }]}
      >
        <Select
          size="large"
          showSearch
          filterOption={(input, option) => {
            const label = option?.label;
            if (typeof label === "string") {
              return label.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
          options={[
            ...(purchaseOrdersData?.dto.map((po) => ({
              value: po.id,
              label: po.purchase_order_no,
            })) || []),
          ]}
        />
      </Form.Item>
      <div className="flex gap-6 justify-between items-center">
        <Form.Item<InvoiceFieldType>
          name="currency"
          label="Currency"
          style={{ width: "100%" }}
          rules={[{ required: true, message: "Please select currency!" }]}
        >
          <Select
            size="large"
            showSearch
            filterOption={(input, option) => {
              const label = option?.label;
              if (typeof label === "string") {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            options={[
              ...(currenciesData?.map((currency) => ({
                value: currency.id,
                label: currency.currency_code,
              })) || []),
            ]}
          />
        </Form.Item>

        <Form.Item<InvoiceFieldType>
          name="usd_exchange_rate"
          label="Exchange Rate (to USD)"
          style={{ width: "100%" }}
          rules={[
            {
              required: true,
              message: "Please select exchange rate!",
            },
            {
              validator: (_, value) => {
                if (value === 0 || value <= 0) {
                  return Promise.reject(
                    new Error("Exchange rate must be greater than 0")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber size="large" style={{ width: "100%" }} type="number" />
        </Form.Item>
      </div>
      <div
        className="rounded-lg border-2 border-[#0000000f] p-4"
        key={invoiceItems?.length}
      >
        <Space
          direction="vertical"
          size="small"
          style={{ marginBottom: 16, gap: 0 }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            Add Items
          </Typography.Title>
          <Typography.Text type="secondary" style={{ margin: 0 }}>
            add products or services to this purchase order
          </Typography.Text>
        </Space>

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
                {poDetailLoading ? (
                  <div className="grid place-items-center h-[200px]">
                    <Spin />
                  </div>
                ) : fields.length === 0 ? (
                  <div className="grid place-items-center py-5">
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      description={null}
                    />
                    <Typography.Text>
                      Select purchase order to add items to this invoice
                    </Typography.Text>
                  </div>
                ) : (
                  <>
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
                      <Col span={1.5}>SELECT</Col>
                      <Col span={4}>PRODUCT</Col>
                      <Col span={2}>ORDERED</Col>
                      <Col span={2}>AVAILABLE</Col>
                      <Col span={4}>PO UNIT PRICE</Col>
                      <Col span={3}>INV QUANTITY</Col>
                      <Col span={4}>
                        INV UNIT PRICE (
                        {getCurrencyCode(
                          form.getFieldValue("currency"),
                          currenciesData
                        )}
                        )
                      </Col>
                      <Col span={2.5}>SUBTOTAL</Col>
                    </Row>

                    {fields.map(({ name, key, ...restField }, index) => {
                      const invoiceItem = invoiceItems?.[name];
                      if (!invoiceItem) return null;
                      const qty = invoiceItem.invoice_quantity || 0;
                      const price = invoiceItem.invoice_unit_price_local || 0;
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
                          {/* Select PI */}
                          <Col span={1}>
                            <Form.Item
                              {...restField}
                              name={[name, "checked"]}
                              valuePropName="checked"
                              initialValue={false}
                              style={{ marginBottom: 0 }}
                            >
                              <Checkbox style={{ marginLeft: 6 }} />
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              style={{ marginBottom: 0 }}
                            >
                              {poDetailData?.product_items.length && (
                                <Typography.Text
                                  style={{
                                    marginLeft: 6,
                                    marginBottom: 0,
                                    display: "block",
                                  }}
                                >
                                  {
                                    poDetailData.product_items[name]
                                      ?.product_name
                                  }
                                </Typography.Text>
                              )}
                            </Form.Item>
                          </Col>

                          {/* Ordered and Available Quantities */}
                          <Col span={2}>
                            {poDetailData && (
                              <Typography.Text
                                style={{
                                  marginBottom: 0,
                                  marginLeft: 14,
                                }}
                              >
                                {poDetailData.product_items[name]?.invoiced}
                              </Typography.Text>
                            )}
                          </Col>

                          <Col span={2}>
                            {poDetailData && (
                              <Typography.Text
                                style={{
                                  marginBottom: 0,
                                  marginLeft: 14,
                                }}
                              >
                                {poDetailData.product_items[name]?.available}
                              </Typography.Text>
                            )}
                          </Col>

                          {/* PO Unit Price */}
                          <Col span={4}>
                            {poDetailData?.product_items?.length && (
                              <div className="flex flex-col ml-4">
                                <Typography.Text
                                  style={{
                                    marginBottom: 0,
                                  }}
                                  strong
                                >
                                  {poDetailData?.product_items[
                                    name
                                  ]?.unit_price_local?.toLocaleString() ||
                                    0}{" "}
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
                            <Form.Item
                              {...restField}
                              name={[name, "invoice_quantity"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Quantity is required",
                                },
                                {
                                  type: "number",
                                  min: form.getFieldValue([
                                    "invoice_items",
                                    name,
                                    "checked",
                                  ])
                                    ? 1
                                    : 0,
                                  message: "Quantity must be at least 1",
                                },
                                {
                                  validator: (_, value) => {
                                    if (
                                      value &&
                                      poDetailData?.product_items[name]
                                        ?.available &&
                                      value >
                                        poDetailData.product_items[name]
                                          .available
                                    ) {
                                      return Promise.reject(
                                        new Error(
                                          "Quantity cannot exceed available stock"
                                        )
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              style={{ marginBottom: 0, marginLeft: 16 }}
                            >
                              <InputNumber
                                type="number"
                                min={
                                  form.getFieldValue([
                                    "invoice_items",
                                    name,
                                    "checked",
                                  ])
                                    ? 1
                                    : 0
                                }
                                max={
                                  poDetailData?.product_items[name]?.available
                                }
                                style={{ width: "100px" }}
                              />
                            </Form.Item>
                          </Col>

                          {/* INV Unit Price */}
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, "invoice_unit_price_local"]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                min={1}
                                style={{ width: "150px", marginLeft: 16 }}
                              />
                            </Form.Item>
                          </Col>

                          {/* Subtotal */}
                          <Col span={3} style={{ marginLeft: 20 }}>
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
                  </>
                )}
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
      <Form.Item
        name="note"
        label={
          <div className="mb-1">
            <Typography.Text style={{ marginRight: 4 }}>Note</Typography.Text>
            <Typography.Text type="secondary">(optional)</Typography.Text>
          </div>
        }
        style={{ marginTop: 16 }}
        rules={[{ required: false }]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter note"
          style={{ width: "100%" }}
        />
      </Form.Item>
    </section>
  );
}
