"use client";

import { useEffect } from "react";
import { Space, Typography, Form, Select, InputNumber, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface StepItemEntryProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export default function StepItemEntry({
  onNext,
  onBack,
  formData,
}: StepItemEntryProps) {
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
        <Typography.Title level={5}>Purchase Order Items</Typography.Title>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "product"]}
                    rules={[{ required: true, message: "Product is required" }]}
                  >
                    <Select
                      placeholder="Select product"
                      style={{ width: 200 }}
                      options={[
                        { value: "product1", label: "Product 1" },
                        { value: "product2", label: "Product 2" },
                        { value: "product3", label: "Product 3" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[
                      { required: true, message: "Quantity is required" },
                    ]}
                  >
                    <InputNumber
                      placeholder="Qty"
                      min={1}
                      style={{ width: 100 }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "price"]}
                    rules={[{ required: true, message: "Price is required" }]}
                  >
                    <InputNumber
                      placeholder="Price"
                      min={0}
                      step={0.01}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
}
