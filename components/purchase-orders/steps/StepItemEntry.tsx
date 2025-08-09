"use client";

import React from "react";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  Space,
  Typography,
  Form,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Checkbox,
  Input,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

// Types
import {
  ProductCurrencyInterface,
  ProductInterface,
} from "@/types/product/product.type";
import { useQuery } from "@tanstack/react-query";
import { useList } from "@/hooks/react-query/useList";
import FormItemInput from "antd/es/form/FormItemInput";

interface StepItemEntryProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepItemEntryRef {
  submitForm: () => void;
  getFormData: () => any;
}

function useForceUpdate() {
  const [, setTick] = React.useState(0);
  return () => setTick((tick) => tick + 1);
}

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const StepItemEntry = forwardRef<StepItemEntryRef, StepItemEntryProps>(
  ({ onNext, onBack, formData }, ref) => {
    const [form] = Form.useForm();

    const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
      queryKey: ["currencies"],
      queryFn: fetchCurrencies,
    });

    const { data: productsData, isLoading: productsLoading } = useList(
      "products",
      {
        pageSize: "all" as any,
        status: "true",
      }
    );

    const forceUpdate = useForceUpdate();

    useEffect(() => {
      // Pre-populate form with existing data
      if (formData) {
        form.setFieldsValue(formData);
      }
    }, [formData, form]);

    const handleNext = () => {
      form.validateFields().then((values) => {
        onNext(values);
      });
    };

    useImperativeHandle(ref, () => ({
      submitForm: handleNext,
      getFormData: () => form.getFieldsValue(),
    }));

    // Helper to get currency code by id
    const getCurrencyCode = (currencyId: number | string) => {
      return (
        currenciesData?.find(
          (c: ProductCurrencyInterface) => c.id === currencyId
        )?.currency_code || ""
      );
    };

    // Helper to calculate total in Local and USD
    const getTotal = () => {
      const items = (form.getFieldValue("items") as any[]) || [];
      const exchangeRate = form.getFieldValue("exchange_rate")
        ? Number(form.getFieldValue("exchange_rate"))
        : 0;
      let totalLocal = 0;
      let currencyIds = new Set();

      items.forEach((item: any) => {
        if (!item || !item.product || item.foc) return;
        const price = item.unit_price || 0;
        totalLocal += (item.quantity || 0) * price;
        if (item.currency_code_id) currencyIds.add(item.currency_code_id);
      });

      const totalUSD = exchangeRate
        ? (totalLocal / exchangeRate).toFixed(2)
        : "0.00";

      let currencyCode = "";

      if (currencyIds.size === 1) {
        currencyCode = getCurrencyCode([...currencyIds][0] as string | number);
      } else if (currencyIds.size > 1) {
        currencyCode = "MULTI";
      }

      return {
        totalLocal: totalLocal.toLocaleString(),
        totalUSD: totalUSD.toLocaleString(),
        currencyCode,
      };
    };

    return (
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNext}
          requiredMark="optional"
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.items) {
              const changedIndex = changedValues.items.findIndex(
                (item: any) =>
                  item && Object.prototype.hasOwnProperty.call(item, "foc")
              );

              if (changedIndex !== -1) {
                const isFOC = changedValues.items[changedIndex].foc;
                const currentItems = form.getFieldValue("items") || [];

                if (isFOC) {
                  currentItems[changedIndex].unit_price = 0;
                  form.setFieldsValue({ items: currentItems });
                }
              }

              forceUpdate();
            }
          }}
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

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  {/* Header Row */}
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
                    <Col span={2}>QUANTITY</Col>
                    <Col span={6}>UNIT PRICE</Col>
                    <Col span={3}>FOC</Col>
                    <Col span={3}>SUBTOTAL</Col>
                    <Col span={3}>ACTIONS</Col>
                  </Row>

                  {/* Line Items */}
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
                                forceUpdate();
                              }}
                            />
                          </Form.Item>
                        </Col>

                        {/* Quantity */}
                        <Col span={2}>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Quantity is required",
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
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>

                        {/* Currency and Unit Price */}
                        <Col span={6}>
                          <Space.Compact style={{ width: "100%" }}>
                            <Form.Item
                              style={{ width: "30%", marginBottom: 0 }}
                              name={[name, "currency_code_id"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Currency is required",
                                },
                              ]}
                            >
                              <Select
                                size="middle"
                                placeholder={
                                  currenciesLoading
                                    ? "Loading currencies..."
                                    : "Select currency"
                                }
                                disabled
                                loading={currenciesLoading}
                                options={currenciesData?.map(
                                  (currency: ProductCurrencyInterface) => ({
                                    value: currency.id,
                                    label: currency.currency_code,
                                  })
                                )}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[name, "unit_price"]}
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (value && parseFloat(value) <= 0) {
                                      return Promise.reject(
                                        new Error(
                                          "Unit price must be greater than 0"
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
                                min={0}
                                style={{ width: "100%" }}
                                disabled={items[name]?.foc}
                              />
                            </Form.Item>
                          </Space.Compact>
                        </Col>

                        {/* FOC */}
                        <Col span={3}>
                          <Form.Item
                            {...restField}
                            name={[name, "foc"]}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Checkbox>Free</Checkbox>
                          </Form.Item>
                        </Col>

                        {/* Subtotal */}
                        <Col span={3}>
                          <div>
                            <span>
                              {subtotal.toLocaleString()}{" "}
                              {getCurrencyCode(
                                (items[name]?.currency_code_id ?? "") as
                                  | string
                                  | number
                              )}
                            </span>
                            <div style={{ fontSize: 12, color: "#aaa" }}>
                              ({subtotalUSD.toLocaleString()} USD)
                            </div>
                          </div>
                        </Col>

                        {/* Remove Button */}
                        <Col span={3}>
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                            style={{ padding: 0 }}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ marginTop: 16 }}
                    >
                      Add More
                    </Button>
                  </Col>
                  <Col span={12} style={{ textAlign: "right", marginTop: 16 }}>
                    <Space direction="vertical" size="small" style={{ gap: 0 }}>
                      <Typography.Text type="secondary">
                        Total Amount:
                      </Typography.Text>
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        {getTotal().totalLocal} {getTotal().currencyCode}
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        ({getTotal().totalUSD} USD)
                      </Typography.Text>
                    </Space>
                  </Col>
                </Row>
              </>
            )}
          </Form.List>
        </Form>
      </div>
    );
  }
);

StepItemEntry.displayName = "StepItemEntry";

export default StepItemEntry;
