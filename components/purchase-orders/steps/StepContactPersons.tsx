"use client";

import { useEffect } from "react";
import { Space, Typography, Form, Input } from "antd";

interface StepContactPersonsProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export default function StepContactPersons({
  onNext,
  onBack,
  formData,
}: StepContactPersonsProps) {
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
        <Typography.Title level={5}>Contact Information</Typography.Title>

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
                  Contact Person Name
                </Typography.Text>
              </div>
            }
            name="contact_name"
            rules={[{ required: true, message: "Contact name is required" }]}
          >
            <Input size="large" placeholder="Enter contact person name" />
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
                  Contact Email
                </Typography.Text>
              </div>
            }
            name="contact_email"
            rules={[
              { required: true, message: "Contact email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input size="large" placeholder="Enter contact email" />
          </Form.Item>
        </Space>

        <Form.Item
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
                Contact Phone
              </Typography.Text>
            </div>
          }
          name="contact_phone"
          rules={[{ required: true, message: "Contact phone is required" }]}
        >
          <Input size="large" placeholder="Enter contact phone number" />
        </Form.Item>
      </Form>
    </div>
  );
}
