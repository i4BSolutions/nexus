import { useList } from "@/hooks/react-query/useList";
import {
  ProductCurrencyInterface,
  ProductInterface,
} from "@/types/product/product.type";
import {
  MinusOutlined,
  PlusOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";

import React from "react";

const { Option } = Select;
const { TextArea } = Input;

interface StockOutProps {
  // onNext: (values: any) => void;
  // onBack: () => void;
  formData?: any;
}

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const StockOut = ({ formData }: StockOutProps) => {
  const [form] = Form.useForm();

  const { data: productsData, isLoading: productsLoading } = useList(
    "products",
    {
      pageSize: "all" as any,
      status: "true",
    }
  );

  return (
    <Card
      styles={{
        header: {
          background: "linear-gradient(90deg, #FFFBE6 0%, #FFFFFF 100%)",
          borderBottom: "1px solid #FFE58F",
        },
      }}
      variant="outlined"
      title={
        <div className="flex items-center gap-3 py-2">
          <div
            style={{
              width: 32,
              height: 32,
              background: "#FFC53D",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <UploadOutlined style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex flex-col">
            <Typography.Text
              strong
              style={{ color: "#000000D9", fontSize: "20px", fontWeight: 500 }}
            >
              Stock Out
            </Typography.Text>
            <Typography.Text
              style={{
                color: "#00000073",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              Move items out of inventory for use or transfer
            </Typography.Text>
          </div>
        </div>
      }
    >
      <Form layout="vertical" form={form} style={{ maxWidth: "100%" }}>
        <Form.Item
          label="Warehouse"
          name="warehouse"
          rules={[
            { required: true, message: "Please choose at least one warehouse" },
          ]}
        >
          <Select allowClear placeholder="Select Warehouse">
            <Option value="Warehouse A">Warehouse A</Option>
          </Select>
        </Form.Item>
        <Card style={{ marginBottom: 12 }}>
          <Space direction="vertical" size="small" style={{ gap: 0 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Select Items
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Select items to move out of inventory for use or transfer
            </Typography.Text>
          </Space>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <Row
                    gutter={16}
                    style={{
                      fontWeight: 600,
                      padding: "12px 8px",
                      background: "#fafafa",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                    align="middle"
                  >
                    <Col span={6}>PRODUCT</Col>
                    <Col span={4}>PRODUCT SKU</Col>
                    <Col span={6}>AVAILABLE QTY</Col>
                    <Col span={6}>QUANTITY TO STOCK OUT</Col>
                  </Row>

                  {fields.map(({ key, name, ...restField }, index) => {
                    const items = (form.getFieldValue("items") as any[]) || [];
                    const quantity = items[name]?.quantity || 0;
                    // Find the selected product
                    const selectedProductId = items[name]?.product;
                    const selectedProduct = (productsData as any)?.items?.find(
                      (p: ProductInterface) => p.id === selectedProductId
                    );

                    const price = items[name]?.unit_price || 0;
                    const exchangeRate = formData?.exchange_rate
                      ? Number(formData.exchange_rate)
                      : 0;
                    const priceUSD = exchangeRate
                      ? (price / exchangeRate).toFixed(2)
                      : "0.00";
                    const subtotal = quantity * price;
                    const subtotalUSD = exchangeRate
                      ? (subtotal / exchangeRate).toFixed(2)
                      : "0.00";

                    // Exclude already selected products except for the current row
                    const selectedProductIds = items
                      .map((item: any, idx: number) =>
                        idx !== name ? item?.product : null
                      )
                      .filter(Boolean);
                    const availableProducts =
                      (productsData as any)?.items?.filter(
                        (product: ProductInterface) =>
                          !selectedProductIds.includes(product.id)
                      ) || [];

                    return (
                      <Row
                        key={key}
                        gutter={16}
                        align="middle"
                        style={{
                          padding: "12px 8px",
                          borderBottom:
                            index !== fields.length - 1
                              ? "1px solid #f0f0f0"
                              : undefined,
                        }}
                      >
                        {/* Product Select */}
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "product"]}
                            rules={[
                              {
                                required: true,
                                message: "Product is required",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder={
                                productsLoading
                                  ? "Loading products..."
                                  : "Select Product"
                              }
                              options={availableProducts.map(
                                (product: ProductInterface) => ({
                                  value: product.id,
                                  label: product.name,
                                })
                              )}
                              loading={productsLoading}
                              showSearch
                              filterOption={(input, option) => {
                                const label = option?.label;
                                if (typeof label === "string") {
                                  return label
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                                }
                                return false;
                              }}
                              onChange={(value) => {
                                // Auto-select the currency from previous step
                                const currentItems =
                                  form.getFieldValue("items") || [];
                                currentItems[name] = {
                                  ...currentItems[name],
                                  product: value,
                                  currency_code_id: formData?.currency || "",
                                };
                                form.setFieldValue("items", currentItems);
                                // forceUpdate();
                              }}
                            />
                          </Form.Item>
                        </Col>

                        {/* Quantity */}
                        <Col span={4}>
                          <Flex style={{ gap: 4 }}>
                            <TagOutlined />
                            <Typography.Text>
                              {selectedProduct?.sku}
                            </Typography.Text>
                          </Flex>
                        </Col>

                        {/* Currency and Unit Price */}
                        <Col span={6}>
                          <Typography.Text>
                            {selectedProduct?.stock}
                          </Typography.Text>
                        </Col>

                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Quantity is required",
                              },
                              {
                                pattern: /^[1-9]\d*$/,
                                message: "Quantity cannot be 0",
                              },
                              {
                                validator: (_, value) => {
                                  if (value && parseFloat(value) <= 0) {
                                    return Promise.reject(
                                      new Error(
                                        "Quantity must be greater than 0"
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              addonBefore={<MinusOutlined />}
                              addonAfter={<PlusOutlined />}
                              min={0}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
                <Col span={12}>
                  <Button
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16 }}
                  >
                    Add More
                  </Button>
                </Col>
              </>
            )}
          </Form.List>
        </Card>
        <Form.Item
          label="Reason"
          required
          name="reason"
          rules={[{ required: true, message: "Please enter a reason" }]}
        >
          <Input placeholder="Please enter a reason" />
        </Form.Item>
        <Form.Item
          label="Destination Warehouse"
          required
          name="destination_warehouse"
          rules={[
            { required: true, message: "Please enter a destination warehouse" },
          ]}
        >
          <Input placeholder="Please enter destination warehouse" />
        </Form.Item>
        <Form.Item label="Note (Optional)" name="note">
          <TextArea placeholder="Enter note" />
        </Form.Item>
        <Flex style={{ justifyContent: "space-between" }}>
          <Button type="default">Reset</Button>
          <Button type="primary" htmlType="submit">
            Complete Stock Out
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};

export default StockOut;
