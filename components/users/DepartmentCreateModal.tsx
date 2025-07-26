"use client";

import { Button, Form, Input, Modal, Typography } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string }) => void;
}

export default function DepartmentCreateModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  const handleFinish = (values: { name: string }) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnHidden
      footer={null}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark="optional"
      >
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
              <Typography.Text style={{ fontSize: 16 }}>Name</Typography.Text>
            </div>
          }
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input size="large" placeholder="Enter name" />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ background: "#8B5CF6", borderColor: "#8B5CF6" }}
          >
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
