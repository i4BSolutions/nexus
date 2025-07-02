"use client";

import { useEffect } from "react";
import { Space, Typography, Form, Descriptions, Card } from "antd";

interface StepReviewSubmitProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export default function StepReviewSubmit({
  onNext,
  onBack,
  formData,
}: StepReviewSubmitProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    // Pre-populate form with existing data
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [formData, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onNext(values);
    });
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Typography.Title level={5}>Review Purchase Order</Typography.Title>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card title="Basic Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="PO Number">
                {formData?.po_number || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {formData?.order_date
                  ? new Date(formData.order_date).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Currency">
                {formData?.currency || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Supplier & Region" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Supplier">
                {formData?.supplier || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {formData?.region || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Contact Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Contact Name">
                {formData?.contact_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Email">
                {formData?.contact_email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Phone">
                {formData?.contact_phone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Items" size="small">
            {formData?.items && formData.items.length > 0 ? (
              <Descriptions column={3}>
                {formData.items.map((item: any, index: number) => (
                  <Descriptions.Item key={index} label={`Item ${index + 1}`}>
                    {item.product} - Qty: {item.quantity} - Price: ${item.price}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <Typography.Text type="secondary">No items added</Typography.Text>
            )}
          </Card>
        </Space>
      </Form>
    </div>
  );
}
