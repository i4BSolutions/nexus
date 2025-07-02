"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";

// Ant Design
import { Space, Typography, Form, DatePicker, Select, Input } from "antd";

// React Query
import { useQuery } from "@tanstack/react-query";

// Types
import { ProductCurrencyInterface } from "@/types/product/product.type";

interface StepDateCurrencyProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepDateCurrencyRef {
  submitForm: () => void;
}

// TODO: Fetch budgets
// const fetchBudgets = async () => {
// const res = await fetch("/api/purchase-orders/purchase-orders-budgets");
// if (!res.ok) throw new Error("Failed to fetch budgets");
// const json = await res.json();
// return { items: json.data };
// };

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const StepDateCurrency = forwardRef<StepDateCurrencyRef, StepDateCurrencyProps>(
  ({ onNext, onBack, formData }, ref) => {
    const [form] = Form.useForm();

    const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
      queryKey: ["currencies"],
      queryFn: fetchCurrencies,
    });

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
    }));

    return (
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNext}
          requiredMark="optional"
        >
          <Space
            size="middle"
            direction="vertical"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Form.Item
                style={{ width: "510px" }}
                label={
                  <div className="flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        margin: "6px 4px 0 0",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 16 }}>
                      Order Date
                    </Typography.Text>
                  </div>
                }
                name="order_date"
                rules={[{ required: true, message: "Order date is required" }]}
              >
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                style={{ width: "510px" }}
                label={
                  <div className="flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        margin: "6px 4px 0 0",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 16 }}>
                      Expected Delivery Date
                    </Typography.Text>
                  </div>
                }
                name="expected_delivery_date"
                rules={[
                  {
                    required: true,
                    message: "Expected delivery date is required",
                  },
                ]}
              >
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Form.Item
                style={{ width: "510px" }}
                label={
                  <div className="flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        margin: "6px 4px 0 0",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 16 }}>
                      Budget
                    </Typography.Text>
                  </div>
                }
                name="budget"
                rules={[{ required: true, message: "Budget is required" }]}
              >
                <Select
                  size="large"
                  placeholder="Select budget"
                  options={[
                    { value: "1", label: "Budget 1" },
                    { value: "2", label: "Budget 2" },
                    { value: "3", label: "Budget 3" },
                  ]}
                />
              </Form.Item>
              <Space
                size="middle"
                style={{ width: "510px", justifyContent: "space-between" }}
              >
                <Form.Item
                  style={{ width: "231px" }}
                  label={
                    <div className="flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          margin: "6px 4px 0 0",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Currency
                      </Typography.Text>
                    </div>
                  }
                  name="currency"
                  rules={[{ required: true, message: "Currency is required" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select currency"
                    options={currenciesData?.map(
                      (currency: ProductCurrencyInterface) => ({
                        value: currency.id,
                        label: currency.currency_code,
                      })
                    )}
                  />
                </Form.Item>

                <Form.Item
                  style={{ width: "231px" }}
                  label={
                    <div className="flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          margin: "6px 4px 0 0",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Exchange Rate (to USD)
                      </Typography.Text>
                    </div>
                  }
                  name="exchange_rate"
                  rules={[
                    { required: true, message: "Exchange rate is required" },
                  ]}
                >
                  <Input size="large" placeholder="Enter exchange rate" />
                </Form.Item>
              </Space>
            </Space>
          </Space>
        </Form>
      </div>
    );
  }
);

StepDateCurrency.displayName = "StepDateCurrency";

export default StepDateCurrency;
