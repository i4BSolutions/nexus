"use client";

import { useEffect } from "react";
import { Space, Typography, Form, DatePicker, Select } from "antd";

interface StepDateCurrencyProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export default function StepDateCurrency({
  onNext,
  onBack,
  formData,
}: StepDateCurrencyProps) {
  const [form] = Form.useForm();

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
              options={[
                { value: "USD", label: "USD - US Dollar" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - British Pound" },
                { value: "JPY", label: "JPY - Japanese Yen" },
                { value: "CAD", label: "CAD - Canadian Dollar" },
              ]}
            />
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
}
