"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

// Ant Design
import { DatePicker, Form, Input, Select, Space, Typography } from "antd";

// Day.js
import dayjs from "dayjs";

// React Query
import { useList } from "@/hooks/react-query/useList";
import { useQuery } from "@tanstack/react-query";

// Types
import { BudgetResponse } from "@/types/budgets/budgets.type";
import { ProductCurrencyInterface } from "@/types/product/product.type";

interface StepDateCurrencyProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepDateCurrencyRef {
  submitForm: () => void;
  getFormData: () => any;
}

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const StepDateCurrency = forwardRef<StepDateCurrencyRef, StepDateCurrencyProps>(
  ({ onNext, onBack, formData }, ref) => {
    const [form] = Form.useForm();
    const [orderDate, setOrderDate] = useState<dayjs.Dayjs | null>(null);

    const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
      queryKey: ["currencies"],
      queryFn: fetchCurrencies,
    });

    const { data: budgetsData, isLoading: budgetsLoading } = useList(
      "budgets",
      {
        pageSize: "all" as any,
        status: "true",
      }
    );

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
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  onChange={(date) => {
                    setOrderDate(date);
                    // Optionally reset expected_delivery_date if it's before new order_date
                    const expected = form.getFieldValue(
                      "expected_delivery_date"
                    );
                    if (date && expected && expected < date) {
                      form.setFieldValue("expected_delivery_date", null);
                    }
                  }}
                />
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
                  placeholder={
                    budgetsLoading ? "Loading budgets..." : "Select budget"
                  }
                  loading={budgetsLoading}
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                  options={
                    (budgetsData as BudgetResponse)?.items?.map((budget) => ({
                      value: budget.id,
                      label: budget.budget_name,
                    })) || []
                  }
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
                    placeholder={
                      currenciesLoading
                        ? "Loading currencies..."
                        : "Select currency"
                    }
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
                    {
                      pattern: /^\d+(\.\d{1,4})?$/,
                      message:
                        "Exchange rate must be a positive number with up to 4 decimal places",
                    },
                    {
                      validator: (_, value) => {
                        if (value && parseFloat(value) <= 0) {
                          return Promise.reject(
                            new Error("Exchange rate must be greater than 0")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
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
