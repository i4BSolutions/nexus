"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { DatePicker, Form, Input, Select, Space, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useList } from "@/hooks/react-query/useList";
import { useQuery } from "@tanstack/react-query";
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

// --- helpers to normalize/denormalize ---
const toFormDates = (data: any) => {
  if (!data) return data;
  return {
    ...data,
    order_date: data.order_date ? dayjs(data.order_date) : null,
    expected_delivery_date: data.expected_delivery_date
      ? dayjs(data.expected_delivery_date)
      : null,
  };
};

const toPayloadDates = (values: any) => ({
  ...values,
  order_date: values.order_date
    ? (values.order_date as Dayjs).toDate().toISOString()
    : null,
  expected_delivery_date: values.expected_delivery_date
    ? (values.expected_delivery_date as Dayjs).toDate().toISOString()
    : null,
});

const StepDateCurrency = forwardRef<StepDateCurrencyRef, StepDateCurrencyProps>(
  ({ onNext, onBack, formData }, ref) => {
    const [form] = Form.useForm();

    const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
      queryKey: ["currencies"],
      queryFn: fetchCurrencies,
    });

    const { data: budgetsData, isLoading: budgetsLoading } = useList(
      "budgets",
      { pageSize: "all" as any, status: "true" }
    );

    useEffect(() => {
      // Normalize incoming strings -> dayjs for DatePicker fields
      if (formData) {
        form.setFieldsValue(toFormDates(formData));
      }
    }, [formData, form]);

    const handleNext = () => {
      form.validateFields().then((values) => {
        // Convert dayjs back -> ISO strings for API / parent
        onNext(toPayloadDates(values));
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
                style={{ width: 510 }}
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
                  allowClear
                  size="large"
                  style={{ width: "100%" }}
                  onChange={(date) => {
                    const expected = form.getFieldValue(
                      "expected_delivery_date"
                    );
                    const expectedDayjs = expected ? dayjs(expected) : null;

                    // If expected < new order date, clear it
                    if (date && expectedDayjs && expectedDayjs.isBefore(date)) {
                      form.setFieldValue("expected_delivery_date", null);
                    }

                    // Revalidate expected date when order date changes
                    form
                      .validateFields(["expected_delivery_date"])
                      .catch(() => {});
                  }}
                />
              </Form.Item>

              <Form.Item
                style={{ width: 510 }}
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
                  // Custom rule: expected >= order
                  ({ getFieldValue }) => ({
                    validator(_, value: Dayjs | undefined) {
                      const order: Dayjs | undefined =
                        getFieldValue("order_date");
                      if (!value || !order) return Promise.resolve();
                      if (value.isAfter(order) || value.isSame(order, "day")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Expected delivery must be on or after the order date"
                        )
                      );
                    },
                  }),
                ]}
              >
                <DatePicker allowClear size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Form.Item
                style={{ width: 510 }}
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
                  filterOption={(input, option) =>
                    typeof option?.label === "string" &&
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={
                    (budgetsData as BudgetResponse)?.items?.map((b) => ({
                      value: b.id,
                      label: b.budget_name,
                    })) || []
                  }
                />
              </Form.Item>

              <Space
                size="middle"
                style={{ width: 510, justifyContent: "space-between" }}
              >
                <Form.Item
                  style={{ width: 231 }}
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
                      (c: ProductCurrencyInterface) => ({
                        value: c.id,
                        label: c.currency_code,
                      })
                    )}
                  />
                </Form.Item>

                <Form.Item
                  style={{ width: 231 }}
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
